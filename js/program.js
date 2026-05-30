import { EXERCISE_LIBRARY } from './exerciseLibrary.js';

export const program = {
  days: [
    {
      id: 'upperA', day: '1', title: 'Upper A', type: 'push', tag: 'Push',
      desc: 'Push-focused · ~62 min',
      exercises: [
        { id: 'incline_bench', name: 'Incline Bench Press', sets: 3, repRange: '6-10', loadType: 'weight' },
        { id: 'db_press', name: 'Dumbbell Press', sets: 2, repRange: '6-10', loadType: 'weight' },
        { id: 'pull_ups', name: 'Pull-Ups', sets: 4, repRange: '6-10', loadType: 'bw' },
        { id: 't_bar', name: 'T-Bar Row', sets: 2, repRange: '8-12', loadType: 'weight' },
        { id: 'shoulder_db_press', name: 'Shoulder DB Press', sets: 2, repRange: '6-10', loadType: 'weight' },
        { id: 'lateral_raises_a', name: 'Dumbbell Lateral Raise', sets: 3, repRange: '10-15', loadType: 'weight' },
        { id: 'barbell_curl_a', name: 'Barbell Bicep Curl', sets: 2, repRange: '8-12', loadType: 'weight' },
        { id: 'tricep_ext_a', name: 'Tricep Extensions (Rope Up)', sets: 2, repRange: '10-15', loadType: 'weight' }
      ]
    },
    {
      id: 'lowerA', day: '2', title: 'Lower A', type: 'legs', tag: 'Quads',
      desc: 'Quad-focused · ~60 min',
      exercises: [
        { id: 'squat', name: 'Squat', sets: 3, repRange: '6-10', loadType: 'weight' },
        { id: 'bulgarian_split', name: 'Bulgarian Split Squat', sets: 2, repRange: '6-10', loadType: 'weight' },
        { id: 'leg_extension', name: 'Leg Extensions', sets: 2, repRange: '10-15', loadType: 'weight' },
        { id: 'leg_curls_a', name: 'Leg Curls', sets: 3, repRange: '10-15', loadType: 'weight' },
        { id: 'standing_calf', name: 'Standing Calf Raises', sets: 2, repRange: '10-15', loadType: 'weight' },
        { id: 'hanging_leg_raise', name: 'Hanging Leg Raises', sets: 3, repRange: '8-12', loadType: 'bw' },
        { id: 'cable_crunch', name: 'Cable Crunches', sets: 3, repRange: '10-15', loadType: 'weight' }
      ]
    },
    {
      id: 'upperB', day: '3', title: 'Upper B', type: 'pull', tag: 'Pull',
      desc: 'Pull-focused · ~65 min',
      exercises: [
        { id: 'lat_pulldown', name: 'Lat Pulldown (narrow)', sets: 4, repRange: '6-10', loadType: 'weight' },
        { id: 'machine_t', name: "Machine T's (chest-supported)", sets: 3, repRange: '8-12', loadType: 'weight' },
        { id: 'db_press_b', name: 'Shoulder Dumbbell Press', sets: 2, repRange: '6-10', loadType: 'weight' },
        { id: 'cable_crossover', name: 'Cable Crossover', sets: 2, repRange: '10-15', loadType: 'weight' },
        { id: 'face_pulls', name: 'Face Pulls', sets: 2, repRange: '10-15', loadType: 'weight' },
        { id: 'lateral_raises_b', name: 'Machine Lateral Raises', sets: 2, repRange: '10-15', loadType: 'weight' },
        { id: 'barbell_curl_b', name: 'Leaning Bicep Machine Curls', sets: 3, repRange: '8-12', loadType: 'weight' },
        { id: 'overhead_tri', name: 'Overhead Tricep Extension', sets: 2, repRange: '10-15', loadType: 'weight' }
      ]
    },
    {
      id: 'lowerB', day: '4', title: 'Lower B', type: 'legs', tag: 'Posterior',
      desc: 'Posterior chain · ~60 min',
      exercises: [
        { id: 'seated_leg_curl', name: 'Seated Leg Curl', sets: 3, repRange: '8-12', loadType: 'weight' },
        { id: 'hip_thrust', name: 'Hip Thrust', sets: 3, repRange: '6-10', loadType: 'weight' },
        { id: 'back_extension', name: '45° Back Extension', sets: 3, repRange: '10-15', loadType: 'weight' },
        { id: 'leg_extension', name: 'Leg Extensions', sets: 2, repRange: '10-15', loadType: 'weight' },
        { id: 'seated_calf', name: 'Seated Calf Raises', sets: 2, repRange: '10-15', loadType: 'weight' },
        { id: 'ab_wheel', name: 'Ab Wheel Rollouts', sets: 3, repRange: '6-10', loadType: 'bw' },
        { id: 'cable_woodchopper', name: 'Cable Push-Outs', sets: 3, repRange: '10-15/side', loadType: 'weight' }
      ]
    }
  ]
};

// Maps library muscleGroup values (new title-case and legacy lowercase) → 7 chart-level groups.
const CHART_GROUP_NORM = {
  // New title-case library categories
  'Chest': 'chest', 'Biceps': 'biceps', 'Triceps': 'triceps', 'Core': 'core',
  'Upper Back': 'back', 'Lats': 'back',
  'Front Delts': 'shoulders', 'Side Delts': 'shoulders', 'Rear Delts': 'shoulders',
  'Quads': 'legs', 'Hamstrings': 'legs', 'Glutes': 'legs', 'Calves': 'legs',
  'Forearms': 'other',
  // Legacy lowercase (kept for any residual values in stored data)
  quads: 'legs', hamstrings: 'legs', glutes: 'legs', calves: 'legs', abs: 'core'
};

// Program-specific exercise IDs that aren't in EXERCISE_LIBRARY (custom IDs,
// legacy variants, or machine-specific exercises without library equivalents).
const PROGRAM_EXERCISE_GROUPS = {
  dips: 'chest', pec_deck_laying: 'chest', cable_crossover: 'chest', lateral_bench_machine: 'chest',
  pull_ups: 'back', t_bar: 'back', machine_t: 'back', iso_lateral_low_row: 'back',
  seated_row: 'back', rope_pulldown: 'back', upright_rows: 'back',
  shoulder_db_press: 'shoulders', db_press_b: 'shoulders',
  lateral_raises_a: 'shoulders', lateral_raises_b: 'shoulders', iso_shoulder_press: 'shoulders',
  barbell_curl_a: 'biceps', barbell_curl_b: 'biceps',
  db_bicep_curl: 'biceps', machine_curl: 'biceps', rope_hammer_curl: 'biceps',
  tricep_ext_a: 'triceps', pushdowns: 'triceps', overhead_tri: 'triceps',
  bulgarian_split: 'legs', leg_curls_a: 'legs', booty_builder: 'legs',
  standing_calf: 'legs', seated_calf: 'legs',
  cable_woodchopper: 'core', steering_wheels: 'core',
  // face_pulls is in the library as 'back'; we chart it under 'shoulders'
  face_pulls: 'shoulders',
};

// Auto-derived from the exercise library so new additions don't need a
// matching entry here. Program-specific entries override library entries.
export const MUSCLE_GROUPS = {
  ...Object.fromEntries(
    EXERCISE_LIBRARY.map(ex => [ex.id, CHART_GROUP_NORM[ex.muscleGroup] ?? ex.muscleGroup])
  ),
  ...PROGRAM_EXERCISE_GROUPS,
};

