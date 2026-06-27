import React, { useState } from "react";
import { collection, query, where, getDocs, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Youtube, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface YouTubeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  subjectId: string;
  moduleId: string;
  startingOrder: number;
}

export function YouTubeImportModal({
  isOpen,
  onClose,
  courseId,
  subjectId,
  moduleId,
  startingOrder
}: YouTubeImportModalProps) {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [importThumbnails, setImportThumbnails] = useState(true);
  const [importDurations, setImportDurations] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [updateExisting, setUpdateExisting] = useState(false);
  
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [stats, setStats] = useState({ success: 0, failed: 0, skipped: 0, updated: 0 });
  const [error, setError] = useState("");
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const extractPlaylistId = (url: string) => {
    const match = url.match(/[?&]list=([^#\&\?]+)/);
    return match ? match[1] : null;
  };

  const parseDuration = (pt: string) => {
    const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "00:00";
    const h = parseInt(match[1] || "0");
    const m = parseInt(match[2] || "0");
    const s = parseInt(match[3] || "0");
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startImport = async () => {
    console.log("Starting YouTube Playlist Import Pipeline...");
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) {
      setError("VITE_YOUTUBE_API_KEY is not configured in .env");
      return;
    }

    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError("Invalid YouTube Playlist URL. Must contain 'list=' parameter.");
      return;
    }

    if (!courseId) {
       setError("Missing courseId. Cannot import lessons.");
       return;
    }

    setError("");
    setIsImporting(true);
    setIsDone(false);
    setStats({ success: 0, failed: 0, skipped: 0, updated: 0 });

    try {
      console.log("Fetching Playlist Title...");
      const plRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`);
      const plData = await plRes.json();
      if (plData.error) throw new Error(plData.error.message);
      const playlistTitle = plData.items?.[0]?.snippet?.title || "Imported Playlist";
      console.log("Playlist Title:", playlistTitle);

      // 1. Fetch Playlist Items
      console.log("Fetching Playlist Items...");
      let videos: any[] = [];
      let nextPageToken = "";
      do {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        videos = videos.concat(data.items || []);
        nextPageToken = data.nextPageToken;
      } while (nextPageToken);

      videos = videos.filter(v => v.snippet.title !== "Private video" && v.snippet.title !== "Deleted video");
      console.log(`Parsed ${videos.length} videos from playlist.`);

      setProgress({ current: 0, total: videos.length });

      // 2. Fetch Durations in batches of 50 if requested
      const durationsMap: Record<string, string> = {};
      if (importDurations && videos.length > 0) {
        console.log("Fetching exact durations...");
        for (let i = 0; i < videos.length; i += 50) {
          const batchIds = videos.slice(i, i + 50).map(v => v.contentDetails.videoId).join(",");
          const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batchIds}&key=${apiKey}`);
          const data = await res.json();
          if (!data.error && data.items) {
            data.items.forEach((item: any) => {
              durationsMap[item.id] = parseDuration(item.contentDetails.duration);
            });
          }
        }
      }

      // 3. Resolve Subject and Module
      let finalSubjectId = subjectId;
      let finalModuleId = moduleId;
      let batch = writeBatch(db);
      let opCount = 0;

      if (!finalSubjectId) {
        console.log("No subjectId provided. Creating new subject...");
        const subjectRef = doc(collection(db, "subjects"));
        finalSubjectId = subjectRef.id;
        batch.set(subjectRef, {
          courseId,
          title: playlistTitle,
          slug: playlistTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          displayOrder: 99, 
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        opCount++;
      }

      if (!finalModuleId) {
        console.log("No moduleId provided. Creating new module...");
        const moduleRef = doc(collection(db, "modules"));
        finalModuleId = moduleRef.id;
        batch.set(moduleRef, {
          courseId,
          subjectId: finalSubjectId,
          title: "Imported Curriculum",
          status: "active",
          displayOrder: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        opCount++;
      }

      // 4. Fetch existing lessons in this module to check duplicates
      let existingLessons: Record<string, any> = {};
      if (finalModuleId) {
        const existingQuery = query(collection(db, "lessons"), where("moduleId", "==", finalModuleId));
        const existingSnap = await getDocs(existingQuery);
        existingSnap.forEach(doc => {
          const data = doc.data();
          if (data.youtubeVideoId) {
            existingLessons[data.youtubeVideoId] = { id: doc.id, ...data };
          }
        });
      }

      // 5. Build Lesson Documents
      console.log("Building lesson documents...");
      let currentOrder = startingOrder;
      const localStats = { success: 0, failed: 0, skipped: 0, updated: 0 };

      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        const videoId = v.contentDetails.videoId;
        const title = v.snippet.title;
        const thumbnail = importThumbnails ? (v.snippet.thumbnails?.maxres?.url || v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url || "") : "";
        const duration = durationsMap[videoId] || "";
        const description = v.snippet.description || "";

        const exists = existingLessons[videoId];

        if (exists) {
          if (skipDuplicates) {
            localStats.skipped++;
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
            continue;
          }
          if (updateExisting) {
            const lessonRef = doc(db, "lessons", exists.id);
            batch.update(lessonRef, {
              title,
              description,
              ...(thumbnail && { thumbnail }),
              ...(duration && { videoDuration: duration, duration }),
              updatedAt: serverTimestamp()
            });
            localStats.updated++;
            opCount++;
          }
        } else {
          const lessonRef = doc(collection(db, "lessons"));
          batch.set(lessonRef, {
            courseId,
            subjectId: finalSubjectId,
            moduleId: finalModuleId,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + videoId.substring(0,4),
            lessonType: "video",
            youtubeUrl: `https://youtube.com/watch?v=${videoId}`,
            youtubeVideoId: videoId,
            thumbnail,
            duration: duration,
            videoDuration: duration,
            description,
            isPreview: false,
            status: "active",
            displayOrder: currentOrder++,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          localStats.success++;
          opCount++;
        }

        setProgress(prev => ({ ...prev, current: prev.current + 1 }));

        if (opCount >= 490) { // Safely below 500 limit
          console.log("Committing batch chunk...");
          await batch.commit();
          console.log("Batch chunk committed successfully.");
          batch = writeBatch(db);
          opCount = 0;
        }
      }

      if (opCount > 0) {
        console.log("Committing final batch...");
        await batch.commit();
        console.log("Final batch committed successfully.");
      }

      console.log("Import pipeline complete. Stats:", localStats);
      setStats(localStats);
      setIsDone(true);
    } catch (err: any) {
      console.error("FATAL ERROR IN IMPORT PIPELINE:", err);
      setError(err.message || "Failed to import playlist");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3 text-red-600 font-display font-bold text-lg">
            <Youtube size={24} />
            Import YouTube Playlist
          </div>
          <button onClick={onClose} disabled={isImporting} className="p-2 text-gray-400 hover:text-navy hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-xl flex items-start gap-3 max-h-32 overflow-y-auto">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="break-all">{error}</p>
            </div>
          )}

          {!isImporting && !isDone && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-navy uppercase tracking-wider">Playlist URL</label>
                <input
                  value={playlistUrl}
                  onChange={(e) => { setPlaylistUrl(e.target.value); setError(""); }}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
                {playlistUrl.length > 0 && !playlistUrl.includes("list=") && (
                  <p className="text-xs text-red-500 font-semibold">Please enter a valid Playlist URL containing 'list='</p>
                )}
                {!import.meta.env.VITE_YOUTUBE_API_KEY && (
                  <div className="p-3 bg-yellow-50 text-yellow-800 text-xs font-semibold rounded-lg flex items-start gap-2 mt-2">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <p>You need to add VITE_YOUTUBE_API_KEY to your .env file for the import to work.</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Import Options</h4>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={importThumbnails} onChange={e=>setImportThumbnails(e.target.checked)} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                  <span className="text-sm font-medium text-navy">Import thumbnails</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={importDurations} onChange={e=>setImportDurations(e.target.checked)} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                  <span className="text-sm font-medium text-navy">Fetch exact durations</span>
                </label>

                <div className="h-px bg-gray-200 my-2" />

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={skipDuplicates} onChange={e=>{
                    setSkipDuplicates(e.target.checked);
                    if(e.target.checked) setUpdateExisting(false);
                  }} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                  <span className="text-sm font-medium text-navy">Skip duplicates (by Video ID)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={updateExisting} onChange={e=>{
                    setUpdateExisting(e.target.checked);
                    if(e.target.checked) setSkipDuplicates(false);
                  }} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                  <span className="text-sm font-medium text-navy">Update existing duplicates</span>
                </label>
              </div>

              <div className="pt-2">
                <button 
                  onClick={startImport}
                  disabled={!playlistUrl.includes("list=")}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Import
                </button>
              </div>
            </>
          )}

          {isImporting && (
            <div className="py-8 flex flex-col items-center justify-center space-y-6">
              <Loader2 size={48} className="text-red-500 animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-bold text-navy">Importing Playlist...</h3>
                <p className="text-gray-500 font-medium mt-1">Processing video {progress.current} of {progress.total}</p>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: progress.total ? `${(progress.current / progress.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )}

          {isDone && !isImporting && (
            <div className="py-6 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-navy">Import Complete!</h3>
                <p className="text-gray-500 mt-2">The playlist has been successfully processed.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-2xl font-black text-green-600">{stats.success}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Added</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-2xl font-black text-blue-600">{stats.updated}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Updated</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-2xl font-black text-amber-500">{stats.skipped}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Skipped</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-2xl font-black text-red-600">{stats.failed}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Failed</div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-saffron transition-colors mt-4"
              >
                Close & View Lessons
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
