/**
 * 列出可用的 Gemini 模型
 */

require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY 未配置');
  process.exit(1);
}

console.log('=== 查询可用的 Gemini 模型 ===\n');

// 尝试 v1beta API
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error('❌ 错误:', data.error.message);
      return;
    }
    
    if (data.models) {
      console.log('✅ 可用模型列表:\n');
      data.models.forEach(model => {
        console.log(`📦 ${model.name}`);
        console.log(`   - 显示名称: ${model.displayName || 'N/A'}`);
        console.log(`   - 支持的方法: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        console.log('');
      });
      
      // 找出支持 generateContent 的模型
      const contentModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (contentModels.length > 0) {
        console.log('\n✨ 推荐使用以下模型（支持 generateContent）:\n');
        contentModels.forEach(model => {
          console.log(`   - ${model.name.replace('models/', '')}`);
        });
      }
    } else {
      console.log('⚠️  未找到模型列表');
      console.log('响应:', JSON.stringify(data, null, 2));
    }
  })
  .catch(error => {
    console.error('❌ 网络错误:', error.message);
  });
