const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async () => {
  const { data, error } = await supabase
    .from('colleges') // <-- Make sure your Supabase table is named EXACTLY 'colleges'
    .select('id, college_name,college_code');

  if (error) {
    console.error('SUPABASE ERROR:', error); // <-- THIS WILL PRINT IN YOUR TERMINAL
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