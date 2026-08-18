const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  // 1. Handle browser preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const collegeId = event.queryStringParameters?.college_id;

  if (!collegeId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing college_id parameter" })
    };
  }

  // Fetch programs for the given college
  const { data, error } = await supabase
    .from('programs')
    .select('id, program, sub_group, college_id')
    .eq('college_id', collegeId)
    .order('program', { ascending: true });

  if (error) {
    console.error("SUPABASE ERROR ON GET-PROGRAMS:", error);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: error.message }) 
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data),
  };
};
