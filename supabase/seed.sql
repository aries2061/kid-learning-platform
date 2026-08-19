-- ====================================================================
-- Phonics Quest - Initial Database Seeding Data (seed.sql)
-- ====================================================================

-- 1. Seed Reward Badges
INSERT INTO public.reward_badges (id, name, description, icon_name, color, bg_gradient)
VALUES
('badge-phonics-star', 'Phonics Super Star', 'Mastered beginner alphabet sounds and blending!', 'star', '#F59E0B', 'from-amber-400 to-yellow-500'),
('badge-word-wizard', 'Word Wizard', 'Magically blended tricky CVC words together!', 'wizard', '#8B5CF6', 'from-purple-500 to-indigo-600'),
('badge-trophy-gold', 'Golden Champion', 'Completed reading sheets with a flawless score!', 'trophy', '#EAB308', 'from-yellow-400 to-amber-600'),
('badge-safari-explorer', 'Phonics Explorer', 'Discovered hidden animal sounds and words!', 'rocket', '#10B981', 'from-emerald-400 to-teal-600'),
('badge-crown-reader', 'Royal Speller', 'Earned the royal crown in word building!', 'crown', '#EC4899', 'from-pink-400 to-rose-500'),
('badge-heart-scholar', 'Joyful Scholar', 'Showed great love for reading and practice!', 'heart', '#EF4444', 'from-red-400 to-pink-600')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color = EXCLUDED.color,
  bg_gradient = EXCLUDED.bg_gradient;

-- 2. Seed Sample Kid Accounts
INSERT INTO public.kids (id, name, age, serial_number, avatar_url, is_custom_photo, notes)
VALUES
('kid-1', 'Leo Lion', 5, '1001', 'avatar-lion', false, 'Loves animal words and short A phonics blending.'),
('kid-2', 'Emma Fox', 6, '1002', 'avatar-fox', false, 'Mastered short vowels; practicing CVC digraphs.'),
('kid-3', 'Sam Panda', 5, '1003', 'avatar-panda', false, 'Doing great with missing letter fill-in exercises.')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Question Bank
INSERT INTO public.questions (
  id, type, title, question_text, show_voice_record_button,
  target_word, word_length, letter_options,
  target_prompt, mc_options,
  full_word, masked_word, missing_letter_index, missing_letter_answer, blank_letter_options,
  matching_pairs,
  reward_type, reward_value, is_skippable, category
)
VALUES
-- Question 1: CVC Cat
(
  'q-cvc-cat', 'cvc_blending', 'Blend the word: CAT',
  'Listen closely and blend the letters to make: CAT',
  true, 'CAT', 3, '["C", "A", "T", "B", "O"]'::jsonb,
  null, null,
  null, null, null, null, null,
  null,
  'stars', 1, false, 'Short A'
),
-- Question 2: CVC Dog
(
  'q-cvc-dog', 'cvc_blending', 'Blend the word: DOG',
  'Listen to the barking pup! Blend the sounds: D - O - G',
  true, 'DOG', 3, '["D", "O", "G", "A", "P"]'::jsonb,
  null, null,
  null, null, null, null, null,
  null,
  'stars', 1, false, 'Short O'
),
-- Question 3: Missing Letter Sun
(
  'q-fib-sun', 'fill_in_blank', 'Fill in the missing letter for SUN',
  'What vowel sound belongs in the middle of S _ N?',
  true,
  null, null, null,
  null, null,
  'SUN', 'S _ N', 1, 'U', '["A", "E", "I", "O", "U"]'::jsonb,
  null,
  'stars', 1, false, 'Short U'
),
-- Question 4: Multiple Choice Letter B
(
  'q-mc-b', 'multiple_choice', 'Which word starts with the /b/ sound?',
  'Which word begins with the letter B sound?',
  true,
  null, null, null,
  'Letter B',
  '[{"id": "opt-1", "text": "Bear 🐻", "isCorrect": true}, {"id": "opt-2", "text": "Cat 🐱", "isCorrect": false}, {"id": "opt-3", "text": "Sun ☀️", "isCorrect": false}, {"id": "opt-4", "text": "Apple 🍎", "isCorrect": false}]'::jsonb,
  null, null, null, null, null,
  null,
  'points', 20, false, 'Phonics Level 1'
),
-- Question 5: Matching Letters
(
  'q-match-1', 'matching', 'Match Alphabet Letters to Word Sounds',
  'Match each letter to its matching vocabulary sound!',
  true,
  null, null, null,
  null, null,
  null, null, null, null, null,
  '[{"id": "p1", "leftPrompt": "A", "rightMatch": "Apple 🍎"}, {"id": "p2", "leftPrompt": "B", "rightMatch": "Ball ⚽"}, {"id": "p3", "leftPrompt": "C", "rightMatch": "Car 🚗"}]'::jsonb,
  'stars', 1, false, 'Alphabet Matching'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Learning Sheets (Curriculums)
INSERT INTO public.question_sheets (
  id, title, description, category,
  question_ids, passing_score, time_limit_seconds,
  reward_badge, reward_bonus_points,
  background_theme, background_music, is_published
)
VALUES
(
  'sheet-short-vowels',
  'Sunny CVC Vowel Explorer',
  'Listen to vowel sounds, drag letter tiles into place, and blend 3-letter words!',
  'Short Vowels',
  '["q-cvc-cat", "q-cvc-dog", "q-fib-sun", "q-mc-b", "q-match-1"]'::jsonb,
  70, 0,
  '{"id": "badge-phonics-star", "name": "Phonics Super Star", "description": "Mastered beginner alphabet sounds and blending!", "iconName": "star", "color": "#F59E0B", "bgGradient": "from-amber-400 to-yellow-500"}'::jsonb,
  50,
  'candy', 'playful_melody', true
),
(
  'sheet-animal-phonics',
  'Wild Safari Phonics Safari',
  'Explore animal names and match letter sounds across the safari jungle!',
  'Safari Animals',
  '["q-cvc-cat", "q-cvc-dog", "q-match-1"]'::jsonb,
  60, 0,
  '{"id": "badge-safari-explorer", "name": "Phonics Explorer", "description": "Discovered hidden animal sounds and words!", "iconName": "rocket", "color": "#10B981", "bgGradient": "from-emerald-400 to-teal-600"}'::jsonb,
  40,
  'safari', 'adventure', true
)
ON CONFLICT (id) DO NOTHING;
