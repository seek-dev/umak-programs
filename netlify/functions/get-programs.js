const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  const collegeId = event.queryStringParameters?.college_id;

  if (!collegeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing college_id parameter" })
    };
  }

  // Fetch programs for the given college
  // NOTE: If your column in Supabase is NOT named 'college_id', change 'college_id' below!
  const { data, error } = await supabase
  .from('programs')
  .select('id, program, sub_group, college_id')
  .eq('college_id', collegeId);

  if (error) {
    console.error("SUPABASE ERROR ON GET-PROGRAMS:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
};