"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigError } from "@/lib/supabase/client";

type ViewMode = "paths" | "courses";

type Course = {
  id: string;
  slug: string;
  title: string;
  format: string;
  level: string;
  duration_minutes: number;
  description: string;
  accent: string;
  status: string;
  lessonCount: number;
};

type LearningPath = {
  id: string;
  slug: string;
  title: string;
  level: string;
  description: string;
  accent: string;
  courses: Course[];
};

type CourseRow = Omit<Course, "lessonCount"> & {
  sort_order: number;
};

type LessonRow = {
  id: string;
  course_id: string;
};

type LearningPathRow = Omit<LearningPath, "courses"> & {
  sort_order: number;
};

type LearningPathCourseRow = {
  learning_path_id: string;
  course_id: string;
  position: number;
};

const courseFormatLabels: Record<string, string> = {
  lesson_course: "Cours",
  podcast_series: "Podcast",
  reading_library: "Lecture",
  culture_module: "Culture",
  kanji_vocab: "Kanji & vocabulaire"
};

export default function DashboardPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("paths");
  const [email, setEmail] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [contentError, setContentError] = useState("");

  const loadDashboardContent = useCallback(async () => {
    if (!supabase) {
      setIsLoadingContent(false);
      return;
    }

    setIsLoadingContent(true);
    setContentError("");

    const [
      { data: courseRows, error: coursesError },
      { data: lessonRows, error: lessonsError },
      { data: pathRows, error: pathsError },
      { data: pathCourseRows, error: pathCoursesError }
    ] = await Promise.all([
      supabase
        .from("courses")
        .select("id, slug, title, format, level, duration_minutes, description, accent, status, sort_order")
        .eq("status", "online")
        .order("sort_order", { ascending: true }),
      supabase.from("course_lessons").select("id, course_id").eq("status", "online"),
      supabase
        .from("learning_paths")
        .select("id, slug, title, level, description, accent, sort_order")
        .eq("status", "online")
        .order("sort_order", { ascending: true }),
      supabase
        .from("learning_path_courses")
        .select("learning_path_id, course_id, position")
        .order("position", { ascending: true })
    ]);

    const firstError = coursesError ?? lessonsError ?? pathsError ?? pathCoursesError;

    if (firstError) {
      setContentError(firstError.message);
      setIsLoadingContent(false);
      return;
    }

    const lessonsByCourse = new Map<string, number>();

    ((lessonRows ?? []) as LessonRow[]).forEach((lesson) => {
      lessonsByCourse.set(lesson.course_id, (lessonsByCourse.get(lesson.course_id) ?? 0) + 1);
    });

    const normalizedCourses = ((courseRows ?? []) as CourseRow[]).map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      format: course.format,
      level: course.level,
      duration_minutes: course.duration_minutes,
      description: course.description,
      accent: course.accent,
      status: course.status,
      lessonCount: lessonsByCourse.get(course.id) ?? 0
    }));

    const coursesById = new Map(normalizedCourses.map((course) => [course.id, course]));
    const pathLinks = ((pathCourseRows ?? []) as LearningPathCourseRow[]).slice().sort((a, b) => {
      return a.position - b.position;
    });

    const normalizedPaths = ((pathRows ?? []) as LearningPathRow[]).map((path) => ({
      id: path.id,
      slug: path.slug,
      title: path.title,
      level: path.level,
      description: path.description,
      accent: path.accent,
      courses: pathLinks
        .filter((link) => link.learning_path_id === path.id)
        .map((link) => coursesById.get(link.course_id))
        .filter((course): course is Course => Boolean(course))
    }));

    setCourses(normalizedCourses);
    setLearningPaths(normalizedPaths);
    setIsLoadingContent(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsCheckingSession(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setEmail(data.session.user.email ?? "");
      setIsCheckingSession(false);
      loadDashboardContent();
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      setEmail(session.user.email ?? "");
      setIsCheckingSession(false);
      loadDashboardContent();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadDashboardContent, router]);

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (isCheckingSession) {
    return (
      <main className="dashboard-page">
        <p className="dashboard-loading">Chargement de ton espace...</p>
      </main>
    );
  }

  if (supabaseConfigError) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-empty" aria-labelledby="dashboard-config-title">
          <p className="eyebrow">Configuration</p>
          <h1 id="dashboard-config-title">Supabase non configuré.</h1>
          <p className="intro">{supabaseConfigError}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{viewMode === "paths" ? "Parcours disponibles" : "Cours disponibles"}</h1>
          <p className="intro">
            Choisis un parcours guidé ou un cours précis pour reprendre ta pratique du japonais.
          </p>
          {email ? <p className="dashboard-user">Connectée avec {email}</p> : null}
        </div>
        <div className="header-actions">
          <Link className="button button-secondary" href="/admin">
            Admin
          </Link>
          <button
            className="button button-secondary"
            disabled={isSigningOut}
            onClick={handleSignOut}
            type="button"
          >
            {isSigningOut ? "Déconnexion..." : "Se déconnecter"}
          </button>
        </div>
      </header>

      <div className="dashboard-toolbar" aria-label="Choix du contenu">
        <div className="view-toggle">
          <button
            className={viewMode === "paths" ? "is-active" : ""}
            onClick={() => setViewMode("paths")}
            type="button"
          >
            Parcours
          </button>
          <button
            className={viewMode === "courses" ? "is-active" : ""}
            onClick={() => setViewMode("courses")}
            type="button"
          >
            Cours
          </button>
        </div>
      </div>

      {isLoadingContent ? <p className="dashboard-loading-content">Chargement des contenus...</p> : null}
      {contentError ? <p className="dashboard-content-error">{contentError}</p> : null}

      {!isLoadingContent && !contentError && viewMode === "paths" ? (
        <section className="course-grid" aria-label="Parcours disponibles">
          {learningPaths.map((path) => (
            <article className={`course-card course-card-${path.accent}`} key={path.id}>
              <div className="course-card-top">
                <span className="course-level">{path.level}</span>
                <span className="course-duration">{path.courses.length} cours</span>
              </div>
              <h2>{path.title}</h2>
              <p>{path.description}</p>
              <div className="path-course-list">
                {path.courses.map((course) => (
                  <span key={course.id}>{course.title}</span>
                ))}
              </div>
              <span className="course-status">Disponible</span>
            </article>
          ))}
          {learningPaths.length === 0 ? (
            <p className="dashboard-empty-state">Aucun parcours disponible pour le moment.</p>
          ) : null}
        </section>
      ) : null}

      {!isLoadingContent && !contentError && viewMode === "courses" ? (
        <section className="course-grid" aria-label="Cours disponibles">
          {courses.map((course) => (
            <article className={`course-card course-card-${course.accent}`} key={course.id}>
              <div className="course-card-top">
                <span className="course-level">{course.level}</span>
                <span className="course-duration">{course.duration_minutes} min</span>
              </div>
              <span className="course-format">{courseFormatLabels[course.format] ?? "Contenu"}</span>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <span className="course-lessons">{course.lessonCount} leçons</span>
              <span className="course-status">Disponible</span>
            </article>
          ))}
          {courses.length === 0 ? (
            <p className="dashboard-empty-state">Aucun cours disponible pour le moment.</p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
