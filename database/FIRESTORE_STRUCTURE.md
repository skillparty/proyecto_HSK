# Firestore Data Structure for HSK Learning App

This document describes the Firestore database structure migrated from Supabase PostgreSQL schema.

## Collections Overview

### 1. `user_profiles`
Stores user profile information.
- **Document ID**: `{userId}` (Firebase Auth UID)
- **Fields**:
  ```javascript
  {
    user_id: string,           // Firebase Auth UID
    username: string,          // GitHub username
    display_name: string,      // Display name from GitHub
    avatar_url: string,        // Avatar URL from GitHub
    github_username: string,   // GitHub username
    preferred_language: string, // Default: 'es'
    created_at: timestamp,
    updated_at: timestamp
  }
  ```

### 2. `user_progress`
Tracks user progress per HSK level.
- **Document ID**: `{userId}_hsk{level}` (e.g., `abc123_hsk1`)
- **Fields**:
  ```javascript
  {
    user_id: string,
    hsk_level: number,         // 1-6
    total_words_studied: number,
    correct_answers: number,
    incorrect_answers: number,
    current_streak: number,
    best_streak: number,
    total_time_spent: number,  // in seconds
    last_study_date: timestamp,
    created_at: timestamp,
    updated_at: timestamp
  }
  ```

### 3. `word_progress`
Individual word tracking for spaced repetition.
- **Document ID**: `{userId}_{wordCharacter}_hsk{level}`
- **Fields**:
  ```javascript
  {
    user_id: string,
    word_character: string,
    word_pinyin: string,
    hsk_level: number,
    times_seen: number,
    times_correct: number,
    times_incorrect: number,
    confidence_level: number,  // 0-5
    last_seen: timestamp,
    created_at: timestamp,
    updated_at: timestamp
  }
  ```

### 4. `quiz_results`
Quiz session results.
- **Document ID**: Auto-generated
- **Fields**:
  ```javascript
  {
    user_id: string,
    hsk_level: number,
    total_questions: number,
    correct_answers: number,
    incorrect_answers: number,
    score_percentage: number,
    time_taken: number,        // in seconds
    quiz_type: string,         // 'multiple_choice', etc.
    created_at: timestamp
  }
  ```

### 5. `matrix_scores`
Matrix game scores.
- **Document ID**: Auto-generated
- **Fields**:
  ```javascript
  {
    user_id: string,
    hsk_level: number,
    difficulty: string,        // 'easy', 'normal', 'hard'
    score: number,
    correct_answers: number,
    incorrect_answers: number,
    time_taken: number,        // in seconds
    accuracy_percentage: number,
    created_at: timestamp
  }
  ```

### 6. `study_sessions`
Study session tracking.
- **Document ID**: Auto-generated
- **Fields**:
  ```javascript
  {
    user_id: string,
    session_type: string,      // 'flashcards', 'quiz', 'matrix_game', 'browse'
    hsk_level: number,
    duration: number,          // in seconds
    words_studied: number,
    correct_answers: number,
    incorrect_answers: number,
    created_at: timestamp
  }
  ```

### 7. `user_achievements`
Unlocked achievements.
- **Document ID**: Auto-generated
- **Fields**:
  ```javascript
  {
    user_id: string,
    achievement_type: string,
    achievement_name: string,
    achievement_description: string,
    points_awarded: number,
    unlocked_at: timestamp
  }
  ```

### 8. `leaderboard` (Denormalized)
Public leaderboard view (updated via Cloud Functions).
- **Document ID**: `{userId}`
- **Fields**:
  ```javascript
  {
    user_id: string,
    username: string,
    display_name: string,
    avatar_url: string,
    total_words: number,       // Sum across all HSK levels
    accuracy_rate: number,     // Average accuracy percentage
    best_streak: number,       // Best streak across all levels
    total_time: number,        // Total time spent
    levels_studied: number,    // Count of distinct HSK levels
    last_activity: timestamp
  }
  ```

## Indexes Required

Create these indexes in Firestore Console for optimal query performance:

1. **user_progress**
   - Composite index: `user_id` (ASC), `hsk_level` (ASC)
   
2. **word_progress**
   - Composite index: `user_id` (ASC), `hsk_level` (ASC)
   
3. **leaderboard**
   - Single-field index: `total_words` (DESC)
   - Single-field index: `accuracy_rate` (DESC)
   - Single-field index: `best_streak` (DESC)
   - Single-field index: `total_time` (DESC)

## Migration Notes

### Key Differences from Supabase/PostgreSQL:

1. **No SQL Functions**: The `update_user_progress` and `update_word_progress` functions are now implemented in the client-side code (`firebase-client.js`).

2. **Denormalized Leaderboard**: Unlike the SQL view in Supabase, Firestore requires a denormalized `leaderboard` collection that should be updated via Cloud Functions when user progress changes.

3. **Document IDs**: We use composite keys (e.g., `{userId}_hsk{level}`) to enable direct document access instead of queries.

4. **Timestamps**: Firestore uses `Timestamp` objects instead of SQL `TIMESTAMP WITH TIME ZONE`.

5. **No JOINs**: Relationships are handled through denormalization or multiple queries.

## Cloud Functions Recommendation

For production, implement Cloud Functions to:
- Update the `leaderboard` collection when user progress changes
- Aggregate statistics periodically
- Handle complex queries that exceed Firestore limitations

Example trigger:
```javascript
exports.updateLeaderboard = functions.firestore
  .document('user_progress/{userId}_hsk{level}')
  .onWrite(async (change, context) => {
    // Aggregate user data and update leaderboard
  });
```

## Security Rules

See `firestore.rules` file for complete security configuration.

Key principles:
- Users can only read/write their own data
- Leaderboard is publicly readable
- Sensitive operations require authentication
