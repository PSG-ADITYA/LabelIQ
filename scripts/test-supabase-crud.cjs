const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment from .env.labeliq or .env
const envFile = fs.existsSync(path.resolve(process.cwd(), '.env.labeliq'))
  ? path.resolve(process.cwd(), '.env.labeliq')
  : path.resolve(process.cwd(), '.env');

if (fs.existsSync(envFile)) {
  const envConfig = dotenv.parse(fs.readFileSync(envFile));
  for (const k in envConfig) {
    if (!process.env[k]) process.env[k] = envConfig[k];
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log(JSON.stringify({
    success: false,
    reason: 'missing_credentials',
    message: 'Supabase URL or Key not found in environment'
  }));
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function testCrud() {
  const testId = `test-crud-${Date.now()}`;
  const results = {
    insert: false,
    read: false,
    update: false,
    delete: false,
    tableReady: true,
    error: null
  };

  try {
    // 1. Test INSERT
    const { data: insData, error: insErr } = await supabase
      .from('products')
      .insert({
        id: testId,
        brandName: 'Test Brand',
        productName: 'Test CRUD Product',
        category: 'General Packaged Food',
        status: 'draft',
        is_demo: false
      })
      .select();

    if (insErr) {
      results.error = insErr.message;
      if (insErr.code === '42P01' || insErr.message.includes('does not exist') || insErr.message.includes('relation')) {
        results.tableReady = false;
      }
      console.log(JSON.stringify(results));
      return;
    }
    results.insert = true;

    // 2. Test READ
    const { data: readData, error: readErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', testId)
      .maybeSingle();

    if (readErr || !readData) {
      results.error = readErr ? readErr.message : 'Record not found after insert';
      console.log(JSON.stringify(results));
      return;
    }
    results.read = true;

    // 3. Test UPDATE
    const { error: updErr } = await supabase
      .from('products')
      .update({ product_name: 'Updated CRUD Product' })
      .eq('id', testId);

    if (updErr) {
      results.error = updErr.message;
      console.log(JSON.stringify(results));
      return;
    }
    results.update = true;

    // 4. Test DELETE
    const { error: delErr } = await supabase
      .from('products')
      .delete()
      .eq('id', testId);

    if (delErr) {
      results.error = delErr.message;
      console.log(JSON.stringify(results));
      return;
    }
    results.delete = true;

    console.log(JSON.stringify({
      success: true,
      ...results
    }));
  } catch (err) {
    results.error = err.message;
    console.log(JSON.stringify({ success: false, ...results }));
  }
}

testCrud();
