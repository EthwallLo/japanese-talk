"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseConfigError } from "@/lib/supabase/client";

type AdminTab = "paths" | "courses" | "lessons" | "lexicon";

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  format: string;
  level: string;
  duration_minutes: number;
  description: string;
  objective: string;
  accent: string;
  status: string;
  sort_order: number;
};

type LessonRow = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  content_type: string;
  description: string;
  objective: string;
  dialogue: string;
  body: string;
  transcript: string;
  translation: string;
  vocabulary_notes: string;
  grammar_notes: string;
  culture_notes: string;
  examples: string;
  exercises: string;
  comprehension_questions: string;
  audio_url: string;
  slow_audio_url: string;
  natural_audio_url: string;
  status: string;
  sort_order: number;
};

type LearningPathRow = {
  id: string;
  slug: string;
  title: string;
  level: string;
  description: string;
  goal: string;
  accent: string;
  status: string;
  sort_order: number;
};

type LearningPathCourseRow = {
  learning_path_id: string;
  course_id: string;
  position: number;
};

type VocabularyItemRow = {
  id: string;
  term: string;
  reading: string;
  meaning_fr: string;
  part_of_speech: string;
  level: string;
  notes: string;
  example_japanese: string;
  example_french: string;
  status: string;
  sort_order: number;
};

type KanjiItemRow = {
  id: string;
  character: string;
  meaning_fr: string;
  onyomi: string;
  kunyomi: string;
  level: string;
  stroke_count: number;
  notes: string;
  examples: string;
  status: string;
  sort_order: number;
};

type LessonVocabularyRow = {
  lesson_id: string;
  vocabulary_item_id: string;
  position: number;
};

type LessonKanjiRow = {
  lesson_id: string;
  kanji_item_id: string;
  position: number;
};

type CourseForm = {
  id: string;
  slug: string;
  title: string;
  format: string;
  level: string;
  duration_minutes: string;
  description: string;
  objective: string;
  accent: string;
  status: string;
  sort_order: string;
};

type LessonForm = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  content_type: string;
  description: string;
  objective: string;
  dialogue: string;
  body: string;
  transcript: string;
  translation: string;
  vocabulary_notes: string;
  grammar_notes: string;
  culture_notes: string;
  examples: string;
  exercises: string;
  comprehension_questions: string;
  audio_url: string;
  slow_audio_url: string;
  natural_audio_url: string;
  status: string;
  sort_order: string;
};

type LearningPathForm = {
  id: string;
  slug: string;
  title: string;
  level: string;
  description: string;
  goal: string;
  accent: string;
  status: string;
  sort_order: string;
};

type VocabularyForm = {
  id: string;
  term: string;
  reading: string;
  meaning_fr: string;
  part_of_speech: string;
  level: string;
  notes: string;
  example_japanese: string;
  example_french: string;
  status: string;
  sort_order: string;
};

type KanjiForm = {
  id: string;
  character: string;
  meaning_fr: string;
  onyomi: string;
  kunyomi: string;
  level: string;
  stroke_count: string;
  notes: string;
  examples: string;
  status: string;
  sort_order: string;
};

const accentOptions = [
  { value: "sakura", label: "Sakura" },
  { value: "mint", label: "Menthe" },
  { value: "amber", label: "Ambre" },
  { value: "indigo", label: "Indigo" }
];

const statusOptions = [
  { value: "draft", label: "Brouillon" },
  { value: "online", label: "En ligne" }
];

const courseFormatOptions = [
  { value: "lesson_course", label: "Cours guidé" },
  { value: "podcast_series", label: "Série podcast" },
  { value: "reading_library", label: "Bibliothèque de lectures" },
  { value: "culture_module", label: "Culture et vie quotidienne" },
  { value: "kanji_vocab", label: "Kanji et vocabulaire" }
];

const contentTypeOptions = [
  { value: "lesson", label: "Leçon courte" },
  { value: "dialogue", label: "Dialogue" },
  { value: "podcast", label: "Podcast" },
  { value: "reading", label: "Lecture facile" },
  { value: "culture", label: "Culture" },
  { value: "kanji_vocab", label: "Kanji et vocabulaire" }
];

function getStatusLabel(status: string) {
  if (status === "published") {
    return "En ligne";
  }

  return statusOptions.find((option) => option.value === status)?.label ?? status;
}

const emptyCourseForm: CourseForm = {
  id: "",
  slug: "",
  title: "",
  format: "lesson_course",
  level: "Grand débutant",
  duration_minutes: "30",
  description: "",
  objective: "",
  accent: "sakura",
  status: "draft",
  sort_order: "10"
};

const emptyLearningPathForm: LearningPathForm = {
  id: "",
  slug: "",
  title: "",
  level: "Vrai débutant",
  description: "",
  goal: "",
  accent: "indigo",
  status: "draft",
  sort_order: "10"
};

function createLessonForm(courseId = ""): LessonForm {
  return {
    id: "",
    course_id: courseId,
    slug: "",
    title: "",
    content_type: "lesson",
    description: "",
    objective: "",
    dialogue: "",
    body: "",
    transcript: "",
    translation: "",
    vocabulary_notes: "",
    grammar_notes: "",
    culture_notes: "",
    examples: "",
    exercises: "",
    comprehension_questions: "",
    audio_url: "",
    slow_audio_url: "",
    natural_audio_url: "",
    status: "draft",
    sort_order: "10"
  };
}

const emptyVocabularyForm: VocabularyForm = {
  id: "",
  term: "",
  reading: "",
  meaning_fr: "",
  part_of_speech: "",
  level: "N5",
  notes: "",
  example_japanese: "",
  example_french: "",
  status: "draft",
  sort_order: "10"
};

const emptyKanjiForm: KanjiForm = {
  id: "",
  character: "",
  meaning_fr: "",
  onyomi: "",
  kunyomi: "",
  level: "N5",
  stroke_count: "0",
  notes: "",
  examples: "",
  status: "draft",
  sort_order: "10"
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function compareBySortOrder<T extends { sort_order: number; title: string }>(a: T, b: T) {
  return a.sort_order - b.sort_order || a.title.localeCompare(b.title);
}

function comparePathCourses(a: LearningPathCourseRow, b: LearningPathCourseRow) {
  return a.position - b.position;
}

function compareVocabulary(a: VocabularyItemRow, b: VocabularyItemRow) {
  return a.sort_order - b.sort_order || a.term.localeCompare(b.term);
}

function compareKanji(a: KanjiItemRow, b: KanjiItemRow) {
  return a.sort_order - b.sort_order || a.character.localeCompare(b.character);
}

function compareLessonResources<T extends { position: number }>(a: T, b: T) {
  return a.position - b.position;
}

function nextPosition(items: Array<{ position: number }>) {
  return items.reduce((highest, item) => Math.max(highest, item.position), 0) + 10;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("paths");
  const [email, setEmail] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPathRow[]>([]);
  const [pathCourses, setPathCourses] = useState<LearningPathCourseRow[]>([]);
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItemRow[]>([]);
  const [kanjiItems, setKanjiItems] = useState<KanjiItemRow[]>([]);
  const [lessonVocabularyLinks, setLessonVocabularyLinks] = useState<LessonVocabularyRow[]>([]);
  const [lessonKanjiLinks, setLessonKanjiLinks] = useState<LessonKanjiRow[]>([]);
  const [courseForm, setCourseForm] = useState<CourseForm>(emptyCourseForm);
  const [lessonForm, setLessonForm] = useState<LessonForm>(createLessonForm());
  const [learningPathForm, setLearningPathForm] = useState<LearningPathForm>(emptyLearningPathForm);
  const [vocabularyForm, setVocabularyForm] = useState<VocabularyForm>(emptyVocabularyForm);
  const [kanjiForm, setKanjiForm] = useState<KanjiForm>(emptyKanjiForm);
  const [selectedLessonCourseId, setSelectedLessonCourseId] = useState("");
  const [selectedResourceLessonId, setSelectedResourceLessonId] = useState("");
  const [selectedPathId, setSelectedPathId] = useState("");
  const [pathCourseForm, setPathCourseForm] = useState({ course_id: "", position: "10" });
  const [lessonVocabularyForm, setLessonVocabularyForm] = useState({ vocabulary_item_id: "", position: "10" });
  const [lessonKanjiForm, setLessonKanjiForm] = useState({ kanji_item_id: "", position: "10" });

  const loadAdminContent = useCallback(async () => {
    if (!supabase) {
      return;
    }

    setIsLoadingContent(true);
    setActionError("");

    const [
      { data: courseRows, error: coursesError },
      { data: lessonRows, error: lessonsError },
      { data: pathRows, error: pathsError },
      { data: pathCourseRows, error: pathCoursesError },
      { data: vocabularyRows, error: vocabularyError },
      { data: kanjiRows, error: kanjiError },
      { data: lessonVocabularyRows, error: lessonVocabularyError },
      { data: lessonKanjiRows, error: lessonKanjiError }
    ] = await Promise.all([
      supabase
        .from("courses")
        .select("id, slug, title, format, level, duration_minutes, description, objective, accent, status, sort_order")
        .order("sort_order", { ascending: true }),
      supabase
        .from("course_lessons")
        .select(
          "id, course_id, slug, title, content_type, description, objective, dialogue, body, transcript, translation, vocabulary_notes, grammar_notes, culture_notes, examples, exercises, comprehension_questions, audio_url, slow_audio_url, natural_audio_url, status, sort_order"
        )
        .order("sort_order", { ascending: true }),
      supabase
        .from("learning_paths")
        .select("id, slug, title, level, description, goal, accent, status, sort_order")
        .order("sort_order", { ascending: true }),
      supabase
        .from("learning_path_courses")
        .select("learning_path_id, course_id, position")
        .order("position", { ascending: true }),
      supabase
        .from("vocabulary_items")
        .select(
          "id, term, reading, meaning_fr, part_of_speech, level, notes, example_japanese, example_french, status, sort_order"
        )
        .order("sort_order", { ascending: true }),
      supabase
        .from("kanji_items")
        .select("id, character, meaning_fr, onyomi, kunyomi, level, stroke_count, notes, examples, status, sort_order")
        .order("sort_order", { ascending: true }),
      supabase
        .from("lesson_vocabulary_items")
        .select("lesson_id, vocabulary_item_id, position")
        .order("position", { ascending: true }),
      supabase
        .from("lesson_kanji_items")
        .select("lesson_id, kanji_item_id, position")
        .order("position", { ascending: true })
    ]);

    const firstError =
      coursesError ??
      lessonsError ??
      pathsError ??
      pathCoursesError ??
      vocabularyError ??
      kanjiError ??
      lessonVocabularyError ??
      lessonKanjiError;

    if (firstError) {
      setActionError(firstError.message);
      setIsLoadingContent(false);
      return;
    }

    const normalizedCourses = ((courseRows ?? []) as CourseRow[]).slice().sort(compareBySortOrder);
    const normalizedLessons = ((lessonRows ?? []) as LessonRow[]).slice().sort(compareBySortOrder);
    const normalizedPaths = ((pathRows ?? []) as LearningPathRow[]).slice().sort(compareBySortOrder);
    const normalizedPathCourses = ((pathCourseRows ?? []) as LearningPathCourseRow[])
      .slice()
      .sort(comparePathCourses);
    const normalizedVocabulary = ((vocabularyRows ?? []) as VocabularyItemRow[]).slice().sort(compareVocabulary);
    const normalizedKanji = ((kanjiRows ?? []) as KanjiItemRow[]).slice().sort(compareKanji);
    const normalizedLessonVocabulary = ((lessonVocabularyRows ?? []) as LessonVocabularyRow[])
      .slice()
      .sort(compareLessonResources);
    const normalizedLessonKanji = ((lessonKanjiRows ?? []) as LessonKanjiRow[]).slice().sort(compareLessonResources);

    setCourses(normalizedCourses);
    setLessons(normalizedLessons);
    setLearningPaths(normalizedPaths);
    setPathCourses(normalizedPathCourses);
    setVocabularyItems(normalizedVocabulary);
    setKanjiItems(normalizedKanji);
    setLessonVocabularyLinks(normalizedLessonVocabulary);
    setLessonKanjiLinks(normalizedLessonKanji);
    setSelectedLessonCourseId((current) =>
      current && normalizedCourses.some((course) => course.id === current)
        ? current
        : normalizedCourses[0]?.id ?? ""
    );
    setLessonForm((current) => ({
      ...current,
      course_id:
        current.course_id && normalizedCourses.some((course) => course.id === current.course_id)
          ? current.course_id
          : normalizedCourses[0]?.id ?? ""
    }));
    setSelectedPathId((current) =>
      current && normalizedPaths.some((path) => path.id === current) ? current : normalizedPaths[0]?.id ?? ""
    );
    setSelectedResourceLessonId((current) =>
      current && normalizedLessons.some((lesson) => lesson.id === current)
        ? current
        : normalizedLessons[0]?.id ?? ""
    );
    setIsLoadingContent(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsCheckingSession(false);
      return;
    }

    let isMounted = true;

    async function loadAccess() {
      if (!supabase) {
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setEmail(data.session.user.email ?? "");

      const { data: profileRow, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", data.session.user.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        setActionError(error.message);
        setIsCheckingSession(false);
        return;
      }

      const profile = profileRow as { is_admin?: boolean } | null;

      if (!profile?.is_admin) {
        setIsAdmin(false);
        setIsCheckingSession(false);
        return;
      }

      setIsAdmin(true);
      setIsCheckingSession(false);
      loadAdminContent();
    }

    loadAccess();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
        return;
      }

      setEmail(session.user.email ?? "");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadAdminContent, router]);

  const selectedPath = useMemo(
    () => learningPaths.find((path) => path.id === selectedPathId) ?? null,
    [learningPaths, selectedPathId]
  );

  const selectedPathLinks = useMemo(
    () => pathCourses.filter((link) => link.learning_path_id === selectedPathId).sort(comparePathCourses),
    [pathCourses, selectedPathId]
  );

  const selectedPathCourseIds = useMemo(
    () => new Set(selectedPathLinks.map((link) => link.course_id)),
    [selectedPathLinks]
  );

  const unlinkedCourses = useMemo(
    () => courses.filter((course) => !selectedPathCourseIds.has(course.id)),
    [courses, selectedPathCourseIds]
  );

  const selectedCourseLessons = useMemo(
    () => lessons.filter((lesson) => lesson.course_id === selectedLessonCourseId).sort(compareBySortOrder),
    [lessons, selectedLessonCourseId]
  );

  const coursesById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const vocabularyById = useMemo(
    () => new Map(vocabularyItems.map((item) => [item.id, item])),
    [vocabularyItems]
  );
  const kanjiById = useMemo(() => new Map(kanjiItems.map((item) => [item.id, item])), [kanjiItems]);
  const selectedLessonVocabularyLinks = useMemo(
    () => lessonVocabularyLinks.filter((link) => link.lesson_id === selectedResourceLessonId).sort(compareLessonResources),
    [lessonVocabularyLinks, selectedResourceLessonId]
  );
  const selectedLessonKanjiLinks = useMemo(
    () => lessonKanjiLinks.filter((link) => link.lesson_id === selectedResourceLessonId).sort(compareLessonResources),
    [lessonKanjiLinks, selectedResourceLessonId]
  );
  const selectedLessonVocabularyIds = useMemo(
    () => new Set(selectedLessonVocabularyLinks.map((link) => link.vocabulary_item_id)),
    [selectedLessonVocabularyLinks]
  );
  const selectedLessonKanjiIds = useMemo(
    () => new Set(selectedLessonKanjiLinks.map((link) => link.kanji_item_id)),
    [selectedLessonKanjiLinks]
  );
  const unlinkedVocabularyItems = useMemo(
    () => vocabularyItems.filter((item) => !selectedLessonVocabularyIds.has(item.id)),
    [selectedLessonVocabularyIds, vocabularyItems]
  );
  const unlinkedKanjiItems = useMemo(
    () => kanjiItems.filter((item) => !selectedLessonKanjiIds.has(item.id)),
    [kanjiItems, selectedLessonKanjiIds]
  );

  function clearFeedback() {
    setActionMessage("");
    setActionError("");
  }

  function resetCourseForm() {
    setCourseForm(emptyCourseForm);
  }

  function resetLearningPathForm() {
    setLearningPathForm(emptyLearningPathForm);
  }

  function resetLessonForm(courseId = selectedLessonCourseId) {
    setLessonForm(createLessonForm(courseId));
  }

  function resetVocabularyForm() {
    setVocabularyForm(emptyVocabularyForm);
  }

  function resetKanjiForm() {
    setKanjiForm(emptyKanjiForm);
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function handleCourseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    clearFeedback();
    setIsSaving(true);

    const slug = slugify(courseForm.slug || courseForm.title);

    if (!slug) {
      setActionError("Le cours doit avoir un slug ou un titre exploitable.");
      setIsSaving(false);
      return;
    }

    const payload = {
      slug,
      title: courseForm.title.trim(),
      format: courseForm.format,
      level: courseForm.level.trim(),
      duration_minutes: toInteger(courseForm.duration_minutes, 0),
      description: courseForm.description.trim(),
      objective: courseForm.objective.trim(),
      accent: courseForm.accent,
      status: courseForm.status,
      sort_order: toInteger(courseForm.sort_order, 0)
    };

    const { error } = courseForm.id
      ? await supabase.from("courses").update(payload).eq("id", courseForm.id)
      : await supabase.from("courses").insert(payload);

    setIsSaving(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage(courseForm.id ? "Cours mis à jour." : "Cours créé.");
    resetCourseForm();
    loadAdminContent();
  }

  async function handleDeleteCourse(course: CourseRow) {
    if (!supabase || !window.confirm(`Supprimer le cours "${course.title}" ?`)) {
      return;
    }

    clearFeedback();
    const { error } = await supabase.from("courses").delete().eq("id", course.id);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Cours supprimé.");
    loadAdminContent();
  }

  async function handleLearningPathSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    clearFeedback();
    setIsSaving(true);

    const slug = slugify(learningPathForm.slug || learningPathForm.title);

    if (!slug) {
      setActionError("Le parcours doit avoir un slug ou un titre exploitable.");
      setIsSaving(false);
      return;
    }

    const payload = {
      slug,
      title: learningPathForm.title.trim(),
      level: learningPathForm.level.trim(),
      description: learningPathForm.description.trim(),
      goal: learningPathForm.goal.trim(),
      accent: learningPathForm.accent,
      status: learningPathForm.status,
      sort_order: toInteger(learningPathForm.sort_order, 0)
    };

    const { error } = learningPathForm.id
      ? await supabase.from("learning_paths").update(payload).eq("id", learningPathForm.id)
      : await supabase.from("learning_paths").insert(payload);

    setIsSaving(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage(learningPathForm.id ? "Parcours mis à jour." : "Parcours créé.");
    resetLearningPathForm();
    loadAdminContent();
  }

  async function handleDeleteLearningPath(path: LearningPathRow) {
    if (!supabase || !window.confirm(`Supprimer le parcours "${path.title}" ?`)) {
      return;
    }

    clearFeedback();
    const { error } = await supabase.from("learning_paths").delete().eq("id", path.id);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Parcours supprimé.");
    loadAdminContent();
  }

  async function handleLessonSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    clearFeedback();
    setIsSaving(true);

    const courseId = lessonForm.course_id || selectedLessonCourseId;
    const slug = slugify(lessonForm.slug || lessonForm.title);

    if (!courseId) {
      setActionError("Choisis un cours avant de créer une leçon.");
      setIsSaving(false);
      return;
    }

    if (!slug) {
      setActionError("La leçon doit avoir un slug ou un titre exploitable.");
      setIsSaving(false);
      return;
    }

    const payload = {
      course_id: courseId,
      slug,
      title: lessonForm.title.trim(),
      content_type: lessonForm.content_type,
      description: lessonForm.description.trim(),
      objective: lessonForm.objective.trim(),
      dialogue: lessonForm.dialogue.trim(),
      body: lessonForm.body.trim(),
      transcript: lessonForm.transcript.trim(),
      translation: lessonForm.translation.trim(),
      vocabulary_notes: lessonForm.vocabulary_notes.trim(),
      grammar_notes: lessonForm.grammar_notes.trim(),
      culture_notes: lessonForm.culture_notes.trim(),
      examples: lessonForm.examples.trim(),
      exercises: lessonForm.exercises.trim(),
      comprehension_questions: lessonForm.comprehension_questions.trim(),
      audio_url: lessonForm.audio_url.trim(),
      slow_audio_url: lessonForm.slow_audio_url.trim(),
      natural_audio_url: lessonForm.natural_audio_url.trim(),
      status: lessonForm.status,
      sort_order: toInteger(lessonForm.sort_order, 0)
    };

    const { error } = lessonForm.id
      ? await supabase.from("course_lessons").update(payload).eq("id", lessonForm.id)
      : await supabase.from("course_lessons").insert(payload);

    setIsSaving(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage(lessonForm.id ? "Leçon mise à jour." : "Leçon créée.");
    resetLessonForm(courseId);
    loadAdminContent();
  }

  async function handleDeleteLesson(lesson: LessonRow) {
    if (!supabase || !window.confirm(`Supprimer la leçon "${lesson.title}" ?`)) {
      return;
    }

    clearFeedback();
    const { error } = await supabase.from("course_lessons").delete().eq("id", lesson.id);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Leçon supprimée.");
    loadAdminContent();
  }

  async function handleAddPathCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    clearFeedback();

    const courseId = pathCourseForm.course_id || (unlinkedCourses[0]?.id ?? "");

    if (!selectedPathId || !courseId) {
      setActionError("Choisis un parcours et un cours à ajouter.");
      return;
    }

    const { error } = await supabase.from("learning_path_courses").insert({
      learning_path_id: selectedPathId,
      course_id: courseId,
      position: toInteger(pathCourseForm.position, nextPosition(selectedPathLinks))
    });

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Cours ajouté au parcours.");
    setPathCourseForm({ course_id: "", position: String(nextPosition(selectedPathLinks) + 10) });
    loadAdminContent();
  }

  async function handleUpdatePathCoursePosition(courseId: string, rawPosition: string) {
    if (!supabase || !selectedPathId) {
      return;
    }

    clearFeedback();

    const { error } = await supabase
      .from("learning_path_courses")
      .update({ position: toInteger(rawPosition, 0) })
      .eq("learning_path_id", selectedPathId)
      .eq("course_id", courseId);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Position mise à jour.");
    loadAdminContent();
  }

  async function handleRemovePathCourse(courseId: string) {
    if (!supabase || !selectedPathId) {
      return;
    }

    clearFeedback();

    const { error } = await supabase
      .from("learning_path_courses")
      .delete()
      .eq("learning_path_id", selectedPathId)
      .eq("course_id", courseId);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Cours retiré du parcours.");
    loadAdminContent();
  }

  async function handleVocabularySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    clearFeedback();
    setIsSaving(true);

    const payload = {
      term: vocabularyForm.term.trim(),
      reading: vocabularyForm.reading.trim(),
      meaning_fr: vocabularyForm.meaning_fr.trim(),
      part_of_speech: vocabularyForm.part_of_speech.trim(),
      level: vocabularyForm.level.trim(),
      notes: vocabularyForm.notes.trim(),
      example_japanese: vocabularyForm.example_japanese.trim(),
      example_french: vocabularyForm.example_french.trim(),
      status: vocabularyForm.status,
      sort_order: toInteger(vocabularyForm.sort_order, 0)
    };

    const { error } = vocabularyForm.id
      ? await supabase.from("vocabulary_items").update(payload).eq("id", vocabularyForm.id)
      : await supabase.from("vocabulary_items").insert(payload);

    setIsSaving(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage(vocabularyForm.id ? "Mot mis à jour." : "Mot ajouté au lexique.");
    resetVocabularyForm();
    loadAdminContent();
  }

  async function handleDeleteVocabulary(item: VocabularyItemRow) {
    if (!supabase || !window.confirm(`Supprimer "${item.term}" du lexique ?`)) {
      return;
    }

    clearFeedback();
    const { error } = await supabase.from("vocabulary_items").delete().eq("id", item.id);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Mot supprimé.");
    loadAdminContent();
  }

  async function handleKanjiSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    clearFeedback();
    setIsSaving(true);

    const payload = {
      character: kanjiForm.character.trim(),
      meaning_fr: kanjiForm.meaning_fr.trim(),
      onyomi: kanjiForm.onyomi.trim(),
      kunyomi: kanjiForm.kunyomi.trim(),
      level: kanjiForm.level.trim(),
      stroke_count: toInteger(kanjiForm.stroke_count, 0),
      notes: kanjiForm.notes.trim(),
      examples: kanjiForm.examples.trim(),
      status: kanjiForm.status,
      sort_order: toInteger(kanjiForm.sort_order, 0)
    };

    const { error } = kanjiForm.id
      ? await supabase.from("kanji_items").update(payload).eq("id", kanjiForm.id)
      : await supabase.from("kanji_items").insert(payload);

    setIsSaving(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage(kanjiForm.id ? "Kanji mis à jour." : "Kanji ajouté.");
    resetKanjiForm();
    loadAdminContent();
  }

  async function handleDeleteKanji(item: KanjiItemRow) {
    if (!supabase || !window.confirm(`Supprimer le kanji "${item.character}" ?`)) {
      return;
    }

    clearFeedback();
    const { error } = await supabase.from("kanji_items").delete().eq("id", item.id);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Kanji supprimé.");
    loadAdminContent();
  }

  async function handleAddLessonVocabulary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    clearFeedback();

    const vocabularyItemId = lessonVocabularyForm.vocabulary_item_id || (unlinkedVocabularyItems[0]?.id ?? "");

    if (!selectedResourceLessonId || !vocabularyItemId) {
      setActionError("Choisis une unité et un mot de vocabulaire.");
      return;
    }

    const { error } = await supabase.from("lesson_vocabulary_items").insert({
      lesson_id: selectedResourceLessonId,
      vocabulary_item_id: vocabularyItemId,
      position: toInteger(lessonVocabularyForm.position, nextPosition(selectedLessonVocabularyLinks))
    });

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Mot associé à l’unité.");
    setLessonVocabularyForm({ vocabulary_item_id: "", position: String(nextPosition(selectedLessonVocabularyLinks) + 10) });
    loadAdminContent();
  }

  async function handleRemoveLessonVocabulary(vocabularyItemId: string) {
    if (!supabase || !selectedResourceLessonId) {
      return;
    }

    clearFeedback();

    const { error } = await supabase
      .from("lesson_vocabulary_items")
      .delete()
      .eq("lesson_id", selectedResourceLessonId)
      .eq("vocabulary_item_id", vocabularyItemId);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Mot retiré de l’unité.");
    loadAdminContent();
  }

  async function handleAddLessonKanji(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    clearFeedback();

    const kanjiItemId = lessonKanjiForm.kanji_item_id || (unlinkedKanjiItems[0]?.id ?? "");

    if (!selectedResourceLessonId || !kanjiItemId) {
      setActionError("Choisis une unité et un kanji.");
      return;
    }

    const { error } = await supabase.from("lesson_kanji_items").insert({
      lesson_id: selectedResourceLessonId,
      kanji_item_id: kanjiItemId,
      position: toInteger(lessonKanjiForm.position, nextPosition(selectedLessonKanjiLinks))
    });

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Kanji associé à l’unité.");
    setLessonKanjiForm({ kanji_item_id: "", position: String(nextPosition(selectedLessonKanjiLinks) + 10) });
    loadAdminContent();
  }

  async function handleRemoveLessonKanji(kanjiItemId: string) {
    if (!supabase || !selectedResourceLessonId) {
      return;
    }

    clearFeedback();

    const { error } = await supabase
      .from("lesson_kanji_items")
      .delete()
      .eq("lesson_id", selectedResourceLessonId)
      .eq("kanji_item_id", kanjiItemId);

    if (error) {
      setActionError(error.message);
      return;
    }

    setActionMessage("Kanji retiré de l’unité.");
    loadAdminContent();
  }

  if (isCheckingSession) {
    return (
      <main className="dashboard-page">
        <p className="dashboard-loading">Chargement de l’administration...</p>
      </main>
    );
  }

  if (supabaseConfigError) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-empty" aria-labelledby="admin-config-title">
          <p className="eyebrow">Configuration</p>
          <h1 id="admin-config-title">Supabase non configuré.</h1>
          <p className="intro">{supabaseConfigError}</p>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-empty" aria-labelledby="admin-denied-title">
          <p className="eyebrow">Admin</p>
          <h1 id="admin-denied-title">Accès réservé.</h1>
          <p className="intro">
            Ton compte est connecté, mais il n’est pas marqué comme administrateur dans Supabase.
          </p>
          <pre className="admin-sql">
            {`update public.profiles
set is_admin = true
where email = '${email || "toi@example.com"}';`}
          </pre>
          {actionError ? <p className="form-error">{actionError}</p> : null}
          <Link className="button button-secondary" href="/dashboard">
            Retour au dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page admin-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Gérer les contenus</h1>
          <p className="intro">Crée les parcours, les cours et les leçons visibles dans l’espace élève.</p>
          {email ? <p className="dashboard-user">Connectée avec {email}</p> : null}
        </div>
        <div className="header-actions">
          <Link className="button button-secondary" href="/dashboard">
            Dashboard
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

      <div className="admin-tabs" aria-label="Sections admin">
        <button className={activeTab === "paths" ? "is-active" : ""} onClick={() => setActiveTab("paths")} type="button">
          Parcours
        </button>
        <button
          className={activeTab === "courses" ? "is-active" : ""}
          onClick={() => setActiveTab("courses")}
          type="button"
        >
          Cours
        </button>
        <button
          className={activeTab === "lessons" ? "is-active" : ""}
          onClick={() => setActiveTab("lessons")}
          type="button"
        >
          Unités
        </button>
        <button
          className={activeTab === "lexicon" ? "is-active" : ""}
          onClick={() => setActiveTab("lexicon")}
          type="button"
        >
          Lexique
        </button>
      </div>

      {isLoadingContent ? <p className="dashboard-loading-content">Chargement des contenus...</p> : null}
      {actionMessage ? <p className="form-message admin-feedback">{actionMessage}</p> : null}
      {actionError ? <p className="form-error admin-feedback">{actionError}</p> : null}

      {activeTab === "paths" ? (
        <>
          <section className="admin-layout" aria-label="Gestion des parcours">
            <form className="admin-section admin-form" onSubmit={handleLearningPathSubmit}>
              <div className="admin-section-heading">
                <h2>{learningPathForm.id ? "Modifier un parcours" : "Créer un parcours"}</h2>
                {learningPathForm.id ? (
                  <button className="button button-secondary button-compact" onClick={resetLearningPathForm} type="button">
                    Nouveau
                  </button>
                ) : null}
              </div>

              <label className="field">
                <span>Titre</span>
                <input
                  required
                  value={learningPathForm.title}
                  onChange={(event) => setLearningPathForm({ ...learningPathForm, title: event.target.value })}
                  placeholder="Débuter en japonais"
                />
              </label>

              <label className="field">
                <span>Slug</span>
                <input
                  value={learningPathForm.slug}
                  onChange={(event) => setLearningPathForm({ ...learningPathForm, slug: event.target.value })}
                  placeholder="debuter-en-japonais"
                />
              </label>

              <div className="admin-form-row">
                <label className="field">
                  <span>Niveau</span>
                  <input
                    required
                    value={learningPathForm.level}
                    onChange={(event) => setLearningPathForm({ ...learningPathForm, level: event.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Ordre</span>
                  <input
                    required
                    inputMode="numeric"
                    value={learningPathForm.sort_order}
                    onChange={(event) => setLearningPathForm({ ...learningPathForm, sort_order: event.target.value })}
                  />
                </label>
              </div>

              <div className="admin-form-row">
                <label className="field">
                  <span>Accent</span>
                  <select
                    value={learningPathForm.accent}
                    onChange={(event) => setLearningPathForm({ ...learningPathForm, accent: event.target.value })}
                  >
                    {accentOptions.map((accent) => (
                      <option key={accent.value} value={accent.value}>
                        {accent.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Statut</span>
                  <select
                    value={learningPathForm.status}
                    onChange={(event) => setLearningPathForm({ ...learningPathForm, status: event.target.value })}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Description</span>
                <textarea
                  required
                  rows={4}
                  value={learningPathForm.description}
                  onChange={(event) => setLearningPathForm({ ...learningPathForm, description: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Objectif du parcours</span>
                <textarea
                  rows={3}
                  value={learningPathForm.goal}
                  onChange={(event) => setLearningPathForm({ ...learningPathForm, goal: event.target.value })}
                />
              </label>

              <button className="button button-primary" disabled={isSaving} type="submit">
                {isSaving ? "Enregistrement..." : learningPathForm.id ? "Mettre à jour" : "Créer le parcours"}
              </button>
            </form>

            <section className="admin-section">
              <div className="admin-section-heading">
                <h2>Parcours</h2>
                <span>{learningPaths.length} éléments</span>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Niveau</th>
                      <th>Statut</th>
                      <th>Ordre</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {learningPaths.map((path) => (
                      <tr key={path.id}>
                        <td>
                          <strong>{path.title}</strong>
                          <span>{path.slug}</span>
                        </td>
                        <td>{path.level}</td>
                        <td>{getStatusLabel(path.status)}</td>
                        <td>{path.sort_order}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="button button-secondary button-compact"
                              onClick={() => setLearningPathForm({ ...path, sort_order: String(path.sort_order) })}
                              type="button"
                            >
                              Modifier
                            </button>
                            <button
                              className="button button-danger button-compact"
                              onClick={() => handleDeleteLearningPath(path)}
                              type="button"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {learningPaths.length === 0 ? (
                      <tr>
                        <td colSpan={5}>Aucun parcours.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </section>

          <section className="admin-section admin-wide" aria-labelledby="path-composer-title">
            <div className="admin-section-heading">
              <div>
                <h2 id="path-composer-title">Composer un parcours</h2>
                <p>Ajoute les cours dans l’ordre d’affichage du parcours sélectionné.</p>
              </div>
              <label className="field field-inline">
                <span>Parcours</span>
                <select value={selectedPathId} onChange={(event) => setSelectedPathId(event.target.value)}>
                  {learningPaths.map((path) => (
                    <option key={path.id} value={path.id}>
                      {path.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <form className="path-course-form" onSubmit={handleAddPathCourse}>
              <label className="field">
                <span>Cours à ajouter</span>
                <select
                  value={pathCourseForm.course_id}
                  onChange={(event) => setPathCourseForm({ ...pathCourseForm, course_id: event.target.value })}
                  disabled={!selectedPath || unlinkedCourses.length === 0}
                >
                  <option value="">{unlinkedCourses.length ? "Choisir un cours" : "Tous les cours sont déjà liés"}</option>
                  {unlinkedCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field path-position-field">
                <span>Position</span>
                <input
                  inputMode="numeric"
                  value={pathCourseForm.position}
                  onChange={(event) => setPathCourseForm({ ...pathCourseForm, position: event.target.value })}
                />
              </label>
              <button className="button button-primary" disabled={!selectedPath || unlinkedCourses.length === 0} type="submit">
                Ajouter
              </button>
            </form>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Cours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPathLinks.map((link) => {
                    const course = coursesById.get(link.course_id);

                    return (
                      <tr key={`${link.learning_path_id}-${link.course_id}`}>
                        <td>
                          <input
                            className="table-input"
                            defaultValue={link.position}
                            inputMode="numeric"
                            onBlur={(event) => handleUpdatePathCoursePosition(link.course_id, event.target.value)}
                          />
                        </td>
                        <td>
                          <strong>{course?.title ?? "Cours introuvable"}</strong>
                          <span>{course?.slug ?? link.course_id}</span>
                        </td>
                        <td>
                          <button
                            className="button button-danger button-compact"
                            onClick={() => handleRemovePathCourse(link.course_id)}
                            type="button"
                          >
                            Retirer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {selectedPathLinks.length === 0 ? (
                    <tr>
                      <td colSpan={3}>Aucun cours dans ce parcours.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === "courses" ? (
        <section className="admin-layout" aria-label="Gestion des cours">
          <form className="admin-section admin-form" onSubmit={handleCourseSubmit}>
            <div className="admin-section-heading">
              <h2>{courseForm.id ? "Modifier un cours" : "Créer un cours"}</h2>
              {courseForm.id ? (
                <button className="button button-secondary button-compact" onClick={resetCourseForm} type="button">
                  Nouveau
                </button>
              ) : null}
            </div>

            <label className="field">
              <span>Titre</span>
              <input
                required
                value={courseForm.title}
                onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })}
                placeholder="Particules は, が, を..."
              />
            </label>

            <label className="field">
              <span>Slug</span>
              <input
                value={courseForm.slug}
                onChange={(event) => setCourseForm({ ...courseForm, slug: event.target.value })}
                placeholder="particules-de-base"
              />
            </label>

            <label className="field">
              <span>Format</span>
              <select value={courseForm.format} onChange={(event) => setCourseForm({ ...courseForm, format: event.target.value })}>
                {courseFormatOptions.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-form-row">
              <label className="field">
                <span>Niveau</span>
                <input
                  required
                  value={courseForm.level}
                  onChange={(event) => setCourseForm({ ...courseForm, level: event.target.value })}
                />
              </label>
              <label className="field">
                <span>Durée</span>
                <input
                  required
                  inputMode="numeric"
                  value={courseForm.duration_minutes}
                  onChange={(event) => setCourseForm({ ...courseForm, duration_minutes: event.target.value })}
                />
              </label>
            </div>

            <div className="admin-form-row">
              <label className="field">
                <span>Accent</span>
                <select value={courseForm.accent} onChange={(event) => setCourseForm({ ...courseForm, accent: event.target.value })}>
                  {accentOptions.map((accent) => (
                    <option key={accent.value} value={accent.value}>
                      {accent.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Statut</span>
                <select value={courseForm.status} onChange={(event) => setCourseForm({ ...courseForm, status: event.target.value })}>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="admin-form-row">
              <label className="field">
                <span>Ordre</span>
                <input
                  required
                  inputMode="numeric"
                  value={courseForm.sort_order}
                  onChange={(event) => setCourseForm({ ...courseForm, sort_order: event.target.value })}
                />
              </label>
            </div>

            <label className="field">
              <span>Description</span>
              <textarea
                required
                rows={4}
                value={courseForm.description}
                onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })}
              />
            </label>

            <label className="field">
              <span>Objectif</span>
              <textarea
                rows={3}
                value={courseForm.objective}
                onChange={(event) => setCourseForm({ ...courseForm, objective: event.target.value })}
              />
            </label>

            <button className="button button-primary" disabled={isSaving} type="submit">
              {isSaving ? "Enregistrement..." : courseForm.id ? "Mettre à jour" : "Créer le cours"}
            </button>
          </form>

          <section className="admin-section">
            <div className="admin-section-heading">
              <h2>Cours</h2>
              <span>{courses.length} éléments</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Format</th>
                    <th>Niveau</th>
                    <th>Statut</th>
                    <th>Durée</th>
                    <th>Ordre</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <strong>{course.title}</strong>
                        <span>{course.slug}</span>
                      </td>
                      <td>{courseFormatOptions.find((format) => format.value === course.format)?.label ?? course.format}</td>
                      <td>{course.level}</td>
                      <td>{getStatusLabel(course.status)}</td>
                      <td>{course.duration_minutes} min</td>
                      <td>{course.sort_order}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="button button-secondary button-compact"
                            onClick={() =>
                              setCourseForm({
                                ...course,
                                duration_minutes: String(course.duration_minutes),
                                sort_order: String(course.sort_order)
                              })
                            }
                            type="button"
                          >
                            Modifier
                          </button>
                          <button
                            className="button button-danger button-compact"
                            onClick={() => handleDeleteCourse(course)}
                            type="button"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={7}>Aucun cours.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      ) : null}

      {activeTab === "lessons" ? (
        <>
          <section className="admin-layout" aria-label="Gestion des unités">
            <form className="admin-section admin-form" onSubmit={handleLessonSubmit}>
              <div className="admin-section-heading">
                <h2>{lessonForm.id ? "Modifier une unité" : "Créer une unité"}</h2>
                {lessonForm.id ? (
                  <button className="button button-secondary button-compact" onClick={() => resetLessonForm()} type="button">
                    Nouvelle
                  </button>
                ) : null}
              </div>

              <label className="field">
                <span>Cours</span>
                <select
                  required
                  value={lessonForm.course_id || selectedLessonCourseId}
                  onChange={(event) => {
                    setSelectedLessonCourseId(event.target.value);
                    setLessonForm({ ...lessonForm, course_id: event.target.value });
                  }}
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-form-row">
                <label className="field">
                  <span>Type</span>
                  <select
                    value={lessonForm.content_type}
                    onChange={(event) => setLessonForm({ ...lessonForm, content_type: event.target.value })}
                  >
                    {contentTypeOptions.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Statut</span>
                  <select value={lessonForm.status} onChange={(event) => setLessonForm({ ...lessonForm, status: event.target.value })}>
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Titre</span>
                <input
                  required
                  value={lessonForm.title}
                  onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })}
                  placeholder="Les voyelles"
                />
              </label>

              <label className="field">
                <span>Slug</span>
                <input
                  value={lessonForm.slug}
                  onChange={(event) => setLessonForm({ ...lessonForm, slug: event.target.value })}
                  placeholder="les-voyelles"
                />
              </label>

              <label className="field">
                <span>Ordre</span>
                <input
                  required
                  inputMode="numeric"
                  value={lessonForm.sort_order}
                  onChange={(event) => setLessonForm({ ...lessonForm, sort_order: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Description</span>
                <textarea
                  required
                  rows={3}
                  value={lessonForm.description}
                  onChange={(event) => setLessonForm({ ...lessonForm, description: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Objectif</span>
                <textarea
                  rows={3}
                  value={lessonForm.objective}
                  onChange={(event) => setLessonForm({ ...lessonForm, objective: event.target.value })}
                />
              </label>

              <div className="admin-form-row">
                <label className="field">
                  <span>Audio</span>
                  <input value={lessonForm.audio_url} onChange={(event) => setLessonForm({ ...lessonForm, audio_url: event.target.value })} />
                </label>
                <label className="field">
                  <span>Audio lent</span>
                  <input
                    value={lessonForm.slow_audio_url}
                    onChange={(event) => setLessonForm({ ...lessonForm, slow_audio_url: event.target.value })}
                  />
                </label>
              </div>

              <label className="field">
                <span>Audio naturel</span>
                <input
                  value={lessonForm.natural_audio_url}
                  onChange={(event) => setLessonForm({ ...lessonForm, natural_audio_url: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Dialogue</span>
                <textarea rows={4} value={lessonForm.dialogue} onChange={(event) => setLessonForm({ ...lessonForm, dialogue: event.target.value })} />
              </label>

              <label className="field">
                <span>Texte / lecture</span>
                <textarea rows={5} value={lessonForm.body} onChange={(event) => setLessonForm({ ...lessonForm, body: event.target.value })} />
              </label>

              <label className="field">
                <span>Transcription</span>
                <textarea
                  rows={5}
                  value={lessonForm.transcript}
                  onChange={(event) => setLessonForm({ ...lessonForm, transcript: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Traduction</span>
                <textarea
                  rows={5}
                  value={lessonForm.translation}
                  onChange={(event) => setLessonForm({ ...lessonForm, translation: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Vocabulaire</span>
                <textarea
                  rows={4}
                  value={lessonForm.vocabulary_notes}
                  onChange={(event) => setLessonForm({ ...lessonForm, vocabulary_notes: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Grammaire</span>
                <textarea
                  rows={4}
                  value={lessonForm.grammar_notes}
                  onChange={(event) => setLessonForm({ ...lessonForm, grammar_notes: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Culture</span>
                <textarea
                  rows={4}
                  value={lessonForm.culture_notes}
                  onChange={(event) => setLessonForm({ ...lessonForm, culture_notes: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Exemples</span>
                <textarea rows={4} value={lessonForm.examples} onChange={(event) => setLessonForm({ ...lessonForm, examples: event.target.value })} />
              </label>

              <label className="field">
                <span>Exercices</span>
                <textarea rows={4} value={lessonForm.exercises} onChange={(event) => setLessonForm({ ...lessonForm, exercises: event.target.value })} />
              </label>

              <label className="field">
                <span>Questions de compréhension</span>
                <textarea
                  rows={4}
                  value={lessonForm.comprehension_questions}
                  onChange={(event) => setLessonForm({ ...lessonForm, comprehension_questions: event.target.value })}
                />
              </label>

              <button className="button button-primary" disabled={isSaving || courses.length === 0} type="submit">
                {isSaving ? "Enregistrement..." : lessonForm.id ? "Mettre à jour" : "Créer l’unité"}
              </button>
            </form>

            <section className="admin-section">
              <div className="admin-section-heading">
                <div>
                  <h2>Unités</h2>
                  <p>Leçons, podcasts, lectures et contenus culturels filtrés par cours.</p>
                </div>
                <label className="field field-inline">
                  <span>Cours</span>
                  <select
                    value={selectedLessonCourseId}
                    onChange={(event) => {
                      setSelectedLessonCourseId(event.target.value);
                      resetLessonForm(event.target.value);
                    }}
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Type</th>
                      <th>Statut</th>
                      <th>Ordre</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCourseLessons.map((lesson) => (
                      <tr key={lesson.id}>
                        <td>
                          <strong>{lesson.title}</strong>
                          <span>{lesson.slug}</span>
                        </td>
                        <td>{contentTypeOptions.find((type) => type.value === lesson.content_type)?.label ?? lesson.content_type}</td>
                        <td>{getStatusLabel(lesson.status)}</td>
                        <td>{lesson.sort_order}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="button button-secondary button-compact"
                              onClick={() => {
                                setLessonForm({
                                  ...lesson,
                                  sort_order: String(lesson.sort_order)
                                });
                                setSelectedResourceLessonId(lesson.id);
                              }}
                              type="button"
                            >
                              Modifier
                            </button>
                            <button
                              className="button button-secondary button-compact"
                              onClick={() => setSelectedResourceLessonId(lesson.id)}
                              type="button"
                            >
                              Lexique
                            </button>
                            <button
                              className="button button-danger button-compact"
                              onClick={() => handleDeleteLesson(lesson)}
                              type="button"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {selectedCourseLessons.length === 0 ? (
                      <tr>
                        <td colSpan={5}>Aucune unité pour ce cours.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </section>

          <section className="admin-section admin-wide" aria-labelledby="lesson-resources-title">
            <div className="admin-section-heading">
              <div>
                <h2 id="lesson-resources-title">Vocabulaire et kanji intégrés</h2>
                <p>Associe les entrées du lexique à une unité pour préparer les révisions et les fiches de contexte.</p>
              </div>
              <label className="field field-inline">
                <span>Unité</span>
                <select value={selectedResourceLessonId} onChange={(event) => setSelectedResourceLessonId(event.target.value)}>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="resource-link-grid">
              <section>
                <h3>Vocabulaire</h3>
                <form className="path-course-form" onSubmit={handleAddLessonVocabulary}>
                  <label className="field">
                    <span>Mot</span>
                    <select
                      value={lessonVocabularyForm.vocabulary_item_id}
                      onChange={(event) => setLessonVocabularyForm({ ...lessonVocabularyForm, vocabulary_item_id: event.target.value })}
                      disabled={!selectedResourceLessonId || unlinkedVocabularyItems.length === 0}
                    >
                      <option value="">{unlinkedVocabularyItems.length ? "Choisir un mot" : "Tout est déjà lié"}</option>
                      {unlinkedVocabularyItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.term} - {item.meaning_fr}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field path-position-field">
                    <span>Position</span>
                    <input
                      inputMode="numeric"
                      value={lessonVocabularyForm.position}
                      onChange={(event) => setLessonVocabularyForm({ ...lessonVocabularyForm, position: event.target.value })}
                    />
                  </label>
                  <button className="button button-primary" disabled={!selectedResourceLessonId || unlinkedVocabularyItems.length === 0} type="submit">
                    Ajouter
                  </button>
                </form>
                <div className="resource-chip-list">
                  {selectedLessonVocabularyLinks.map((link) => {
                    const item = vocabularyById.get(link.vocabulary_item_id);

                    return (
                      <span className="resource-chip" key={link.vocabulary_item_id}>
                        {link.position}. {item?.term ?? "Mot introuvable"}
                        <button onClick={() => handleRemoveLessonVocabulary(link.vocabulary_item_id)} type="button">
                          Retirer
                        </button>
                      </span>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3>Kanji</h3>
                <form className="path-course-form" onSubmit={handleAddLessonKanji}>
                  <label className="field">
                    <span>Kanji</span>
                    <select
                      value={lessonKanjiForm.kanji_item_id}
                      onChange={(event) => setLessonKanjiForm({ ...lessonKanjiForm, kanji_item_id: event.target.value })}
                      disabled={!selectedResourceLessonId || unlinkedKanjiItems.length === 0}
                    >
                      <option value="">{unlinkedKanjiItems.length ? "Choisir un kanji" : "Tout est déjà lié"}</option>
                      {unlinkedKanjiItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.character} - {item.meaning_fr}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field path-position-field">
                    <span>Position</span>
                    <input
                      inputMode="numeric"
                      value={lessonKanjiForm.position}
                      onChange={(event) => setLessonKanjiForm({ ...lessonKanjiForm, position: event.target.value })}
                    />
                  </label>
                  <button className="button button-primary" disabled={!selectedResourceLessonId || unlinkedKanjiItems.length === 0} type="submit">
                    Ajouter
                  </button>
                </form>
                <div className="resource-chip-list">
                  {selectedLessonKanjiLinks.map((link) => {
                    const item = kanjiById.get(link.kanji_item_id);

                    return (
                      <span className="resource-chip" key={link.kanji_item_id}>
                        {link.position}. {item?.character ?? "Kanji introuvable"}
                        <button onClick={() => handleRemoveLessonKanji(link.kanji_item_id)} type="button">
                          Retirer
                        </button>
                      </span>
                    );
                  })}
                </div>
              </section>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === "lexicon" ? (
        <section className="admin-layout lexicon-layout" aria-label="Gestion du lexique">
          <form className="admin-section admin-form" onSubmit={handleVocabularySubmit}>
            <div className="admin-section-heading">
              <h2>{vocabularyForm.id ? "Modifier un mot" : "Ajouter un mot"}</h2>
              {vocabularyForm.id ? (
                <button className="button button-secondary button-compact" onClick={resetVocabularyForm} type="button">
                  Nouveau
                </button>
              ) : null}
            </div>

            <label className="field">
              <span>Terme</span>
              <input
                required
                value={vocabularyForm.term}
                onChange={(event) => setVocabularyForm({ ...vocabularyForm, term: event.target.value })}
                placeholder="こんにちは"
              />
            </label>

            <label className="field">
              <span>Lecture</span>
              <input value={vocabularyForm.reading} onChange={(event) => setVocabularyForm({ ...vocabularyForm, reading: event.target.value })} />
            </label>

            <label className="field">
              <span>Sens en français</span>
              <input
                required
                value={vocabularyForm.meaning_fr}
                onChange={(event) => setVocabularyForm({ ...vocabularyForm, meaning_fr: event.target.value })}
              />
            </label>

            <div className="admin-form-row">
              <label className="field">
                <span>Nature</span>
                <input
                  value={vocabularyForm.part_of_speech}
                  onChange={(event) => setVocabularyForm({ ...vocabularyForm, part_of_speech: event.target.value })}
                  placeholder="nom, verbe, expression..."
                />
              </label>
              <label className="field">
                <span>Niveau</span>
                <input value={vocabularyForm.level} onChange={(event) => setVocabularyForm({ ...vocabularyForm, level: event.target.value })} />
              </label>
            </div>

            <label className="field">
              <span>Statut</span>
              <select
                value={vocabularyForm.status}
                onChange={(event) => setVocabularyForm({ ...vocabularyForm, status: event.target.value })}
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Ordre</span>
              <input
                required
                inputMode="numeric"
                value={vocabularyForm.sort_order}
                onChange={(event) => setVocabularyForm({ ...vocabularyForm, sort_order: event.target.value })}
              />
            </label>

            <label className="field">
              <span>Exemple japonais</span>
              <textarea
                rows={3}
                value={vocabularyForm.example_japanese}
                onChange={(event) => setVocabularyForm({ ...vocabularyForm, example_japanese: event.target.value })}
              />
            </label>

            <label className="field">
              <span>Traduction de l’exemple</span>
              <textarea
                rows={3}
                value={vocabularyForm.example_french}
                onChange={(event) => setVocabularyForm({ ...vocabularyForm, example_french: event.target.value })}
              />
            </label>

            <label className="field">
              <span>Notes</span>
              <textarea rows={3} value={vocabularyForm.notes} onChange={(event) => setVocabularyForm({ ...vocabularyForm, notes: event.target.value })} />
            </label>

            <button className="button button-primary" disabled={isSaving} type="submit">
              {isSaving ? "Enregistrement..." : vocabularyForm.id ? "Mettre à jour" : "Ajouter le mot"}
            </button>
          </form>

          <section className="admin-section">
            <div className="admin-section-heading">
              <h2>Vocabulaire</h2>
              <span>{vocabularyItems.length} éléments</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Terme</th>
                    <th>Sens</th>
                    <th>Niveau</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vocabularyItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.term}</strong>
                        <span>{item.reading || item.part_of_speech || "Sans lecture"}</span>
                      </td>
                      <td>{item.meaning_fr}</td>
                      <td>{item.level}</td>
                      <td>{getStatusLabel(item.status)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="button button-secondary button-compact"
                            onClick={() =>
                              setVocabularyForm({
                                ...item,
                                sort_order: String(item.sort_order)
                              })
                            }
                            type="button"
                          >
                            Modifier
                          </button>
                          <button
                            className="button button-danger button-compact"
                            onClick={() => handleDeleteVocabulary(item)}
                            type="button"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vocabularyItems.length === 0 ? (
                    <tr>
                      <td colSpan={5}>Aucun mot de vocabulaire.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <form className="admin-section admin-form" onSubmit={handleKanjiSubmit}>
            <div className="admin-section-heading">
              <h2>{kanjiForm.id ? "Modifier un kanji" : "Ajouter un kanji"}</h2>
              {kanjiForm.id ? (
                <button className="button button-secondary button-compact" onClick={resetKanjiForm} type="button">
                  Nouveau
                </button>
              ) : null}
            </div>

            <label className="field">
              <span>Kanji</span>
              <input
                required
                value={kanjiForm.character}
                onChange={(event) => setKanjiForm({ ...kanjiForm, character: event.target.value })}
                placeholder="日"
              />
            </label>

            <label className="field">
              <span>Sens en français</span>
              <input
                required
                value={kanjiForm.meaning_fr}
                onChange={(event) => setKanjiForm({ ...kanjiForm, meaning_fr: event.target.value })}
              />
            </label>

            <div className="admin-form-row">
              <label className="field">
                <span>On’yomi</span>
                <input value={kanjiForm.onyomi} onChange={(event) => setKanjiForm({ ...kanjiForm, onyomi: event.target.value })} />
              </label>
              <label className="field">
                <span>Kun’yomi</span>
                <input value={kanjiForm.kunyomi} onChange={(event) => setKanjiForm({ ...kanjiForm, kunyomi: event.target.value })} />
              </label>
            </div>

            <div className="admin-form-row">
              <label className="field">
                <span>Niveau</span>
                <input value={kanjiForm.level} onChange={(event) => setKanjiForm({ ...kanjiForm, level: event.target.value })} />
              </label>
              <label className="field">
                <span>Traits</span>
                <input
                  inputMode="numeric"
                  value={kanjiForm.stroke_count}
                  onChange={(event) => setKanjiForm({ ...kanjiForm, stroke_count: event.target.value })}
                />
              </label>
            </div>

            <label className="field">
              <span>Statut</span>
              <select value={kanjiForm.status} onChange={(event) => setKanjiForm({ ...kanjiForm, status: event.target.value })}>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Ordre</span>
              <input
                required
                inputMode="numeric"
                value={kanjiForm.sort_order}
                onChange={(event) => setKanjiForm({ ...kanjiForm, sort_order: event.target.value })}
              />
            </label>

            <label className="field">
              <span>Exemples</span>
              <textarea rows={3} value={kanjiForm.examples} onChange={(event) => setKanjiForm({ ...kanjiForm, examples: event.target.value })} />
            </label>

            <label className="field">
              <span>Notes</span>
              <textarea rows={3} value={kanjiForm.notes} onChange={(event) => setKanjiForm({ ...kanjiForm, notes: event.target.value })} />
            </label>

            <button className="button button-primary" disabled={isSaving} type="submit">
              {isSaving ? "Enregistrement..." : kanjiForm.id ? "Mettre à jour" : "Ajouter le kanji"}
            </button>
          </form>

          <section className="admin-section">
            <div className="admin-section-heading">
              <h2>Kanji</h2>
              <span>{kanjiItems.length} éléments</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kanji</th>
                    <th>Sens</th>
                    <th>Niveau</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kanjiItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.character}</strong>
                        <span>{[item.onyomi, item.kunyomi].filter(Boolean).join(" / ") || "Lectures à compléter"}</span>
                      </td>
                      <td>{item.meaning_fr}</td>
                      <td>{item.level}</td>
                      <td>{getStatusLabel(item.status)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="button button-secondary button-compact"
                            onClick={() =>
                              setKanjiForm({
                                ...item,
                                stroke_count: String(item.stroke_count),
                                sort_order: String(item.sort_order)
                              })
                            }
                            type="button"
                          >
                            Modifier
                          </button>
                          <button
                            className="button button-danger button-compact"
                            onClick={() => handleDeleteKanji(item)}
                            type="button"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {kanjiItems.length === 0 ? (
                    <tr>
                      <td colSpan={5}>Aucun kanji.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      ) : null}
    </main>
  );
}
