import { supabase } from "../db/supabase";

export async function getCompletedChapters(studentId: string): Promise<number[]> {
    const { data, error } = await supabase
        .from("progress")
        .select("chapter_id")
        .eq("student_id", studentId)
        .order("chapter_id");

    if (error) {
        throw new Error(error.message);
    }

    return data.map(row => row.chapter_id);
}

export async function completeChapter(
    studentId: string,
    chapterId: number
): Promise<void> {
    const { error } = await supabase.from("progress").insert({
        student_id: studentId,
        chapter_id: chapterId
    });

    if (error) {
        // duplicate = already completed
        if (error.code === "23505") {
            throw new Error("DUPLICATE");
        }
        throw new Error(error.message);
    }
}

export async function completeChapterSequential(
    studentId: string,
    chapterId: number
): Promise<void> {
    const { error } = await supabase.rpc(
        "complete_chapter_sequential",
        {
            p_student_id: studentId,
            p_chapter_id: chapterId
        }
    );

    if (error) {
        if (error.message.includes("PREVIOUS_CHAPTER_NOT_COMPLETED")) {
            throw new Error("PREVIOUS");
        }
        if (error.code === "23505") {
            throw new Error("DUPLICATE");
        }
        throw new Error(error.message);
    }
}