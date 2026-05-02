-- 添加tags字段到dictionaries表
ALTER TABLE dictionaries
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_dictionaries_tags ON dictionaries USING GIN (tags);

-- 注释
COMMENT ON COLUMN dictionaries.tags IS '单词的标签列表，用于分类和过滤';
