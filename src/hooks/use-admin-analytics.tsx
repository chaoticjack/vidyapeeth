import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  getCountFromServer, 
  getAggregateFromServer, 
  average, 
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfDay, subDays, startOfYear, format } from 'date-fns';

export type DateRange = 'today' | '7d' | '30d' | '90d' | 'year' | 'all';

export interface KPI {
  value: number;
  growth: number; // Percentage
}

export interface AdminAnalyticsData {
  kpis: {
    totalUsers: KPI;
    activeStudents: KPI;
    totalEnrollments: KPI;
    coursesPublished: KPI;
    blogsPublished: KPI;
    demoRequests: KPI;
    vsatRegistrations: KPI;
    averageCompletion: KPI;
    completedCourses: KPI;
    pendingDemoRequests: KPI;
    pendingVsatRegistrations: KPI;
  };
  charts: {
    userRegistrations: any[];
    enrollmentTrend: any[];
    demoBookingTrend: any[];
    vsatTrend: any[];
    coursePopularity: any[];
    courseCompletion: any[];
    studentActivity: any[];
    blogTrend: any[];
  };
  topCourses: any[];
  topClasses: any[];
  recentActivity: any[];
  funnel: {
    visitors: number;
    demos: number;
    enrollments: number;
    activeStudents: number;
    completedCourses: number;
  };
  loading: boolean;
  error: string | null;
}

// Helpers for dates
function getDateRangeBounds(range: DateRange) {
  const now = new Date();
  let start: Date;
  let prevStart: Date;

  switch (range) {
    case 'today':
      start = startOfDay(now);
      prevStart = subDays(start, 1);
      break;
    case '7d':
      start = subDays(now, 7);
      prevStart = subDays(start, 7);
      break;
    case '30d':
      start = subDays(now, 30);
      prevStart = subDays(start, 30);
      break;
    case '90d':
      start = subDays(now, 90);
      prevStart = subDays(start, 90);
      break;
    case 'year':
      start = startOfYear(now);
      prevStart = subDays(start, 365); // approx
      break;
    case 'all':
    default:
      start = new Date(2020, 0, 1); // Way in the past
      prevStart = new Date(2010, 0, 1);
      break;
  }
  return { start, prevStart, now };
}

function calculateGrowth(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Generic fetcher for bucketed charts
async function fetchChartData(
  colName: string, 
  dateField: string, 
  start: Date, 
  now: Date, 
  bucketFormat: string
) {
  try {
    const buckets: Record<string, number> = {};
    
    // Pre-fill buckets so empty charts still show the x-axis
    let curr = new Date(start);
    if (bucketFormat.includes('yyyy')) {
      curr.setDate(1);
      while (curr <= now) {
        buckets[format(curr, bucketFormat)] = 0;
        curr.setMonth(curr.getMonth() + 1);
      }
    } else {
      curr = startOfDay(curr);
      const endOfDayNow = new Date(now);
      endOfDayNow.setHours(23, 59, 59, 999);
      while (curr <= endOfDayNow) {
        buckets[format(curr, bucketFormat)] = 0;
        curr.setDate(curr.getDate() + 1);
      }
    }

    const q = query(
      collection(db, colName),
      where(dateField, '>=', start.toISOString()),
      where(dateField, '<=', now.toISOString())
    );
    
    const snap = await getDocs(q);
  
  snap.forEach(doc => {
    const data = doc.data();
    const dateStr = data[dateField];
    let dateObj: Date | null = null;
    
    if (!dateStr) return;
    
    if (typeof dateStr === 'string') {
      dateObj = new Date(dateStr);
    } else if (dateStr.toDate) {
      dateObj = dateStr.toDate();
    }
    
    if (dateObj) {
      const bucket = format(dateObj, bucketFormat);
      if (buckets[bucket] !== undefined) {
        buckets[bucket] += 1;
      }
    }
  });

  return Object.entries(buckets)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      // Parse format 'MMM yyyy' or 'MMM dd' back to dates for sorting
      const dateA = new Date(a.name + (bucketFormat.includes('yyyy') ? '' : ` ${new Date().getFullYear()}`));
      const dateB = new Date(b.name + (bucketFormat.includes('yyyy') ? '' : ` ${new Date().getFullYear()}`));
      return dateA.getTime() - dateB.getTime();
    });
  } catch (e) {
    console.error(`Chart data query failed for ${colName}:`, e);
    return [];
  }
}

export function useAdminAnalytics(dateRange: DateRange = '30d') {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const { start, prevStart, now } = getDateRangeBounds(dateRange);

        // 1. KPI Queries (Totals and Growths)
        const getKpi = async (colName: string, dateField: string = 'createdAt', extraFilters: any[] = [], jsFilter?: (d: any) => boolean) => {
          const colRef = collection(db, colName);
          const totalQ = query(colRef, ...extraFilters);
          
          let totalCount = 0;
          try {
            const t = await getCountFromServer(totalQ);
            totalCount = t.data().count;
          } catch (e: any) {
            console.error(`Total KPI query failed for ${colName}:`, e);
            throw new Error(`Failed to fetch ${colName}: ${e.message}`);
          }

          let currentCount = 0;
          let prevCount = 0;
          
          try {
            if (extraFilters.length > 0 && jsFilter) {
              // Fetch docs manually for the date window to avoid composite index requirements
              const currentQ = query(colRef, where(dateField, '>=', start), where(dateField, '<=', now));
              const prevQ = query(colRef, where(dateField, '>=', prevStart), where(dateField, '<', start));
              
              const [cSnap, pSnap] = await Promise.all([getDocs(currentQ), getDocs(prevQ)]);
              currentCount = cSnap.docs.filter(d => jsFilter(d.data())).length;
              prevCount = pSnap.docs.filter(d => jsFilter(d.data())).length;
            } else {
              const currentQ = query(colRef, ...extraFilters, where(dateField, '>=', start), where(dateField, '<=', now));
              const prevQ = query(colRef, ...extraFilters, where(dateField, '>=', prevStart), where(dateField, '<', start));
              
              const [current, prev] = await Promise.all([
                getCountFromServer(currentQ),
                getCountFromServer(prevQ)
              ]);
              currentCount = current.data().count;
              prevCount = prev.data().count;
            }
          } catch (e) {
            console.warn(`Growth KPI query failed for ${colName} (missing index?):`, e);
          }
          
          return {
            value: totalCount,
            growth: calculateGrowth(currentCount, prevCount)
          };
        };

        // Fetch Demos manually to handle legacy documents without 'status' field
        const allDemosSnap = await getDocs(collection(db, 'demoRegistrations'));
        let totalDemosCount = 0;
        let pendingDemosCount = 0;
        allDemosSnap.forEach(doc => {
           totalDemosCount++;
           const d = doc.data();
           if (!d.status || d.status === 'pending') {
             pendingDemosCount++;
           }
        });
        const demoRequests = { value: totalDemosCount, growth: 0 };
        const pendingDemos = { value: pendingDemosCount, growth: 0 };

        // Parallelize KPI fetching
        const [
          totalUsers,
          totalEnrollments,
          coursesPublished,
          blogsPublished,
          vsatRegistrations,
          pendingVsat,
          completedCoursesCount
        ] = await Promise.all([
          getKpi('users', 'createdAt'),
          getKpi('enrollments', 'enrolledAt'),
          getKpi('courses', 'createdAt', [where('published', '==', true)], d => d.published === true),
          getKpi('blogs', 'createdAt', [where('published', '==', true)], d => d.published === true),
          getKpi('vsatRegistrations', 'createdAt'),
          getKpi('vsatRegistrations', 'createdAt', [where('status', 'in', ['pending', 'registered'])], d => ['pending', 'registered'].includes(d.status)),
          getKpi('progress', 'lastActivityAt', [where('percentage', '==', 100)], d => d.percentage === 100) 
        ]);

        // Active Students (Unique userIds in enrollments)
        const allEnrollmentsSnap = await getDocs(collection(db, 'enrollments'));
        const uniqueStudentIds = new Set();
        const coursePopularityMap: Record<string, number> = {};
        allEnrollmentsSnap.forEach(doc => {
          const d = doc.data();
          if (d.userId) uniqueStudentIds.add(d.userId);
          if (d.courseId) coursePopularityMap[d.courseId] = (coursePopularityMap[d.courseId] || 0) + 1;
        });

        const activeStudents = {
          value: uniqueStudentIds.size,
          growth: 0 
        };

        // Fetch all progress to calculate overall and per-course averages in memory (avoids composite index)
        const allProgressSnap = await getDocs(collection(db, "progress"));
        let totalPercentage = 0;
        let progressCount = 0;
        const courseProgressMap: Record<string, { total: number, count: number }> = {};
        
        allProgressSnap.forEach(doc => {
          const d = doc.data();
          if (typeof d.percentage === 'number') {
            totalPercentage += d.percentage;
            progressCount++;
            
            if (d.courseId) {
              if (!courseProgressMap[d.courseId]) {
                courseProgressMap[d.courseId] = { total: 0, count: 0 };
              }
              courseProgressMap[d.courseId].total += d.percentage;
              courseProgressMap[d.courseId].count++;
            }
          }
        });
        
        const avgCompletionVal = progressCount > 0 ? Math.round(totalPercentage / progressCount) : 0;
        
        // Fetch all courses to map names
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const courseNames: Record<string, string> = {};
        coursesSnap.forEach(doc => {
          courseNames[doc.id] = doc.data().title || doc.data().name || 'Unknown Course';
        });

        const coursePopularity = Object.entries(coursePopularityMap)
          .map(([courseId, enrollments]) => ({
            name: courseNames[courseId] || courseId,
            enrollments
          }))
          .sort((a, b) => b.enrollments - a.enrollments)
          .slice(0, 10);

        const courseCompletion = Object.keys(courseProgressMap)
          .map(cId => {
            const stats = courseProgressMap[cId];
            return {
              id: cId,
              name: courseNames[cId] || cId,
              completion: stats.count > 0 ? Math.round(stats.total / stats.count) : 0
            };
          })
          .filter(c => c.name !== c.id) // Optional: filter out unknown courses if needed
          .sort((a, b) => b.completion - a.completion)
          .slice(0, 10);

        // Funnel
        const funnel = {
          visitors: totalUsers.value * 3, // Placeholder for future integration as requested
          demos: demoRequests.value,
          enrollments: totalEnrollments.value,
          activeStudents: activeStudents.value,
          completedCourses: completedCoursesCount.value
        };

        // Charts (Time-series)
        const bucketFmt = dateRange === 'today' || dateRange === '7d' || dateRange === '30d' ? 'MMM dd' : 'MMM yyyy';
        
        const [
          userRegistrations,
          enrollmentTrend,
          demoBookingTrend,
          vsatTrend,
          blogTrend,
          studentActivity,
          recentActivitySnap
        ] = await Promise.all([
          fetchChartData('users', 'createdAt', start, now, bucketFmt),
          fetchChartData('enrollments', 'enrolledAt', start, now, bucketFmt),
          fetchChartData('demoRegistrations', 'createdAt', start, now, bucketFmt),
          fetchChartData('vsatRegistrations', 'createdAt', start, now, bucketFmt),
          fetchChartData('blogs', 'createdAt', start, now, bucketFmt),
          fetchChartData('activities', 'timestamp', start, now, bucketFmt),
          getDocs(query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(20)))
        ]);

        const recentActivity: any[] = [];
        recentActivitySnap.forEach(doc => {
          recentActivity.push({ id: doc.id, ...doc.data() });
        });

        if (isMounted) {
          setData({
            kpis: {
              totalUsers,
              activeStudents,
              totalEnrollments,
              coursesPublished,
              blogsPublished,
              demoRequests,
              vsatRegistrations,
              averageCompletion: { value: avgCompletionVal, growth: 0 },
              completedCourses: completedCoursesCount,
              pendingDemoRequests: pendingDemos,
              pendingVsatRegistrations: pendingVsat,
            },
            charts: {
              userRegistrations,
              enrollmentTrend,
              demoBookingTrend,
              vsatTrend,
              coursePopularity,
              courseCompletion: courseCompletion.sort((a, b) => b.completion - a.completion).slice(0, 10),
              studentActivity,
              blogTrend,
            },
            topCourses: coursePopularity,
            topClasses: [],
            recentActivity,
            funnel,
            loading: false,
            error: null
          });
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Analytics fetch error:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [dateRange]);

  return { data, loading, error };
}
