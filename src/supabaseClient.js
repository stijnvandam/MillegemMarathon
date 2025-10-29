import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uevrynlpqflpdbuezfep.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVldnJ5bmxwcWZscGRidWV6ZmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzk5NjEsImV4cCI6MjA3NjgxNTk2MX0.7Z8VI3c8WXY22GOVifKQAyga_gBrW3l9KY6_44gcTeg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
