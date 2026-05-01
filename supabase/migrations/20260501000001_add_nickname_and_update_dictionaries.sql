-- Add nickname field to profiles table
alter table public.profiles
add column nickname text;

-- Update dictionaries table structure for detailed word information
alter table public.dictionaries
add column phonetic text,
add column definition_native text,
add column definition_target text,
add column mnemonics text,
add column examples jsonb default '[]'::jsonb,
add column conversation_history jsonb default '[]'::jsonb;

-- Add index for faster queries
create index dictionaries_word_idx on public.dictionaries(word);

-- Update the dictionaries table comment
comment on column public.dictionaries.phonetic is 'Phonetic transcription of the word';
comment on column public.dictionaries.definition_native is 'Definition in user native language';
comment on column public.dictionaries.definition_target is 'Definition in target language';
comment on column public.dictionaries.mnemonics is 'Memory aids and mnemonics';
comment on column public.dictionaries.examples is 'Array of example sentences with translations';
comment on column public.dictionaries.conversation_history is 'Chat history with LLM for this word';
