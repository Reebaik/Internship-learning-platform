import { supabase } from "../src/db/supabase";

export async function resetProgressTable() {
    await supabase.from("progress").delete().neq("student_id", "");
}
