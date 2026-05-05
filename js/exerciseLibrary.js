export const EXERCISE_LIBRARY = [
  // CHEST
  { id: 'bench_press', name: 'Barbell Bench Press', muscleGroup: 'chest', loadType: 'weight' },
  { id: 'incline_bench', name: 'Incline Barbell Bench Press', muscleGroup: 'chest', loadType: 'weight' },
  { id: 'db_press', name: 'Dumbbell Press', muscleGroup: 'chest', loadType: 'weight' },
  { id: 'incline_db_press', name: 'Incline Dumbbell Press', muscleGroup: 'chest', loadType: 'weight' },
  { id: 'cable_fly', name: 'Cable Fly', muscleGroup: 'chest', loadType: 'weight' },
  { id: 'pec_deck', name: 'Pec Deck Machine', muscleGroup: 'chest', loadType: 'weight' },
  { id: 'dips_chest', name: 'Dips (Chest Focused)', muscleGroup: 'chest', loadType: 'bw' },
  { id: 'pushups', name: 'Push-Ups', muscleGroup: 'chest', loadType: 'bw' },

  // BACK
  { id: 'deadlift', name: 'Conventional Deadlift', muscleGroup: 'back', loadType: 'weight' },
  { id: 'barbell_row', name: 'Barbell Row', muscleGroup: 'back', loadType: 'weight' },
  { id: 'db_row', name: 'Dumbbell Row', muscleGroup: 'back', loadType: 'weight' },
  { id: 'tbar_row', name: 'T-Bar Row', muscleGroup: 'back', loadType: 'weight' },
  { id: 'cable_row', name: 'Seated Cable Row', muscleGroup: 'back', loadType: 'weight' },
  { id: 'lat_pulldown', name: 'Lat Pulldown', muscleGroup: 'back', loadType: 'weight' },
  { id: 'pullups', name: 'Pull-Ups', muscleGroup: 'back', loadType: 'bw' },
  { id: 'chinups', name: 'Chin-Ups', muscleGroup: 'back', loadType: 'bw' },
  { id: 'face_pulls', name: 'Face Pulls', muscleGroup: 'back', loadType: 'weight' },

  // SHOULDERS
  { id: 'ohp', name: 'Overhead Press (Barbell)', muscleGroup: 'shoulders', loadType: 'weight' },
  { id: 'db_shoulder_press', name: 'Dumbbell Shoulder Press', muscleGroup: 'shoulders', loadType: 'weight' },
  { id: 'lateral_raise', name: 'Lateral Raise', muscleGroup: 'shoulders', loadType: 'weight' },
  { id: 'front_raise', name: 'Front Raise', muscleGroup: 'shoulders', loadType: 'weight' },
  { id: 'rear_delt_fly', name: 'Rear Delt Fly', muscleGroup: 'shoulders', loadType: 'weight' },
  { id: 'arnold_press', name: 'Arnold Press', muscleGroup: 'shoulders', loadType: 'weight' },
  { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', muscleGroup: 'shoulders', loadType: 'weight' },

  // BICEPS
  { id: 'barbell_curl', name: 'Barbell Curl', muscleGroup: 'biceps', loadType: 'weight' },
  { id: 'db_curl', name: 'Dumbbell Curl', muscleGroup: 'biceps', loadType: 'weight' },
  { id: 'hammer_curl', name: 'Hammer Curl', muscleGroup: 'biceps', loadType: 'weight' },
  { id: 'preacher_curl', name: 'Preacher Curl', muscleGroup: 'biceps', loadType: 'weight' },
  { id: 'cable_curl', name: 'Cable Curl', muscleGroup: 'biceps', loadType: 'weight' },
  { id: 'concentration_curl', name: 'Concentration Curl', muscleGroup: 'biceps', loadType: 'weight' },

  // TRICEPS
  { id: 'close_grip_bench', name: 'Close-Grip Bench Press', muscleGroup: 'triceps', loadType: 'weight' },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', muscleGroup: 'triceps', loadType: 'weight' },
  { id: 'overhead_tricep_ext', name: 'Overhead Tricep Extension', muscleGroup: 'triceps', loadType: 'weight' },
  { id: 'skull_crushers', name: 'Skull Crushers', muscleGroup: 'triceps', loadType: 'weight' },
  { id: 'dips_tricep', name: 'Dips (Tricep Focused)', muscleGroup: 'triceps', loadType: 'bw' },
  { id: 'tricep_kickback', name: 'Tricep Kickback', muscleGroup: 'triceps', loadType: 'weight' },

  // QUADS
  { id: 'squat', name: 'Barbell Back Squat', muscleGroup: 'quads', loadType: 'weight' },
  { id: 'front_squat', name: 'Front Squat', muscleGroup: 'quads', loadType: 'weight' },
  { id: 'leg_press', name: 'Leg Press', muscleGroup: 'quads', loadType: 'weight' },
  { id: 'leg_extension', name: 'Leg Extension', muscleGroup: 'quads', loadType: 'weight' },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', muscleGroup: 'quads', loadType: 'weight' },
  { id: 'lunges', name: 'Walking Lunges', muscleGroup: 'quads', loadType: 'weight' },
  { id: 'hack_squat', name: 'Hack Squat', muscleGroup: 'quads', loadType: 'weight' },

  // HAMSTRINGS
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroup: 'hamstrings', loadType: 'weight' },
  { id: 'leg_curl', name: 'Lying Leg Curl', muscleGroup: 'hamstrings', loadType: 'weight' },
  { id: 'seated_leg_curl', name: 'Seated Leg Curl', muscleGroup: 'hamstrings', loadType: 'weight' },
  { id: 'good_mornings', name: 'Good Mornings', muscleGroup: 'hamstrings', loadType: 'weight' },
  { id: 'nordic_curl', name: 'Nordic Hamstring Curl', muscleGroup: 'hamstrings', loadType: 'bw' },

  // GLUTES
  { id: 'hip_thrust', name: 'Barbell Hip Thrust', muscleGroup: 'glutes', loadType: 'weight' },
  { id: 'glute_bridge', name: 'Glute Bridge', muscleGroup: 'glutes', loadType: 'weight' },
  { id: 'cable_kickback', name: 'Cable Glute Kickback', muscleGroup: 'glutes', loadType: 'weight' },
  { id: 'step_ups', name: 'Step-Ups', muscleGroup: 'glutes', loadType: 'weight' },

  // CALVES
  { id: 'standing_calf_raise', name: 'Standing Calf Raise', muscleGroup: 'calves', loadType: 'weight' },
  { id: 'seated_calf_raise', name: 'Seated Calf Raise', muscleGroup: 'calves', loadType: 'weight' },
  { id: 'calf_press', name: 'Calf Press (Leg Press Machine)', muscleGroup: 'calves', loadType: 'weight' },

  // ABS/CORE
  { id: 'plank', name: 'Plank', muscleGroup: 'abs', loadType: 'bw' },
  { id: 'ab_wheel', name: 'Ab Wheel Rollout', muscleGroup: 'abs', loadType: 'bw' },
  { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', muscleGroup: 'abs', loadType: 'bw' },
  { id: 'cable_crunch', name: 'Cable Crunch', muscleGroup: 'abs', loadType: 'weight' },
  { id: 'russian_twist', name: 'Russian Twist', muscleGroup: 'abs', loadType: 'weight' },
  { id: 'pallof_press', name: 'Pallof Press', muscleGroup: 'abs', loadType: 'weight' },
];

export function getExerciseById(id) {
  return EXERCISE_LIBRARY.find(ex => ex.id === id);
}

export function getExercisesByMuscleGroup(muscleGroup) {
  return EXERCISE_LIBRARY.filter(ex => ex.muscleGroup === muscleGroup);
}

export function searchExercises(query) {
  const q = query.toLowerCase();
  return EXERCISE_LIBRARY.filter(ex => ex.name.toLowerCase().includes(q));
}
