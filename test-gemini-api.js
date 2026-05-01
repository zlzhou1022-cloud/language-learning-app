/**
 * Gemini API 测试脚本
 * 用于验证 API Key 是否正确配置
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('=== Gemini API 测试 ===\n');

// 检查 API Key
console.log('1. 检查 API Key:');
console.log('   - 是否存在:', !!GEMINI_API_KEY);
console.log('   - 长度:', GEMINI_API_KEY?.length || 0);
console.log('   - 前缀:', GEMINI_API_KEY?.substring(0, 10) || 'none');
console.log('   - 格式正确:', GEMINI_API_KEY?.startsWith('AIza') || false);
console.log('');

if (!GEMINI_API_KEY) {
  console.error('❌ 错误: GEMINI_API_KEY 未配置');
  console.log('\n请在 .env.local 文件中添加:');
  console.log('GEMINI_API_KEY=your-api-key-here');
  process.exit(1);
}

if (!GEMINI_API_KEY.startsWith('AIza')) {
  console.warn('⚠️  警告: API Key 格式可能不正确');
  console.log('   正确的格式应该以 "AIza" 开头');
  console.log('');
}

// 测试 API 调用
console.log('2. 测试 API 调用:');
console.log('   发送测试请求...');

const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

fetch(testUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [{
      role: 'user',
      parts: [{ text: 'Say hello in one word' }]
    }]
  })
})
  .then(response => {
    console.log('   - HTTP 状态:', response.status);
    return response.json();
  })
  .then(data => {
    if (data.error) {
      console.error('   ❌ API 错误:', data.error.message);
      console.log('\n可能的原因:');
      console.log('   1. API Key 无效或已过期');
      console.log('   2. API Key 没有启用 Generative Language API');
      console.log('   3. 超出配额限制');
      console.log('\n解决方法:');
      console.log('   访问 https://makersuite.google.com/app/apikey');
      console.log('   创建新的 API Key 并更新 .env.local');
    } else if (data.candidates && data.candidates[0]) {
      const response = data.candidates[0].content.parts[0].text;
      console.log('   ✅ API 调用成功!');
      console.log('   - 响应:', response);
      console.log('\n🎉 Gemini API 配置正确，可以正常使用!');
    } else {
      console.log('   ⚠️  收到响应但格式异常');
      console.log('   - 响应数据:', JSON.stringify(data, null, 2));
    }
  })
  .catch(error => {
    console.error('   ❌ 网络错误:', error.message);
    console.log('\n可能的原因:');
    console.log('   1. 网络连接问题');
    console.log('   2. 防火墙阻止');
    console.log('   3. API 端点不可访问');
  });
