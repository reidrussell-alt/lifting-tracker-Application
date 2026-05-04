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
        { id: 'leg_ext_a', name: 'Leg Extensions', sets: 2, repRange: '10-15', loadType: 'weight' },
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
        { id: 'leg_ext_b', name: 'Leg Extensions', sets: 2, repRange: '10-15', loadType: 'weight' },
        { id: 'seated_calf', name: 'Seated Calf Raises', sets: 2, repRange: '10-15', loadType: 'weight' },
        { id: 'ab_wheel', name: 'Ab Wheel Rollouts', sets: 3, repRange: '6-10', loadType: 'bw' },
        { id: 'cable_woodchopper', name: 'Cable Push-Outs', sets: 3, repRange: '10-15/side', loadType: 'weight' }
      ]
    }
  ]
};

export const MUSCLE_GROUPS = {
  // Chest
  incline_bench: 'chest', db_press: 'chest', dips: 'chest',
  pec_deck: 'chest', pec_deck_laying: 'chest',
  cable_crossover: 'chest', lateral_bench_machine: 'chest',
  // Back
  pull_ups: 'back', lat_pulldown: 'back', t_bar: 'back',
  machine_t: 'back', iso_lateral_low_row: 'back', seated_row: 'back',
  rope_pulldown: 'back', upright_rows: 'back', back_extension: 'back',
  // Shoulders
  shoulder_db_press: 'shoulders', db_press_b: 'shoulders',
  lateral_raises_a: 'shoulders', lateral_raises_b: 'shoulders',
  iso_shoulder_press: 'shoulders', face_pulls: 'shoulders',
  // Biceps
  barbell_curl_a: 'biceps', barbell_curl_b: 'biceps',
  db_bicep_curl: 'biceps', machine_curl: 'biceps', rope_hammer_curl: 'biceps',
  // Triceps
  tricep_ext_a: 'triceps', pushdowns: 'triceps', overhead_tri: 'triceps',
  // Legs
  squat: 'legs', bulgarian_split: 'legs', leg_ext_a: 'legs', leg_ext_b: 'legs',
  hip_thrust: 'legs', leg_curls_a: 'legs', seated_leg_curl: 'legs',
  booty_builder: 'legs', standing_calf: 'legs', seated_calf: 'legs',
  // Core / Abs
  hanging_leg_raise: 'core', cable_crunch: 'core', ab_wheel: 'core',
  cable_woodchopper: 'core', steering_wheels: 'core'
};

export const MUSCLE_GROUP_ORDER = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'];

export const MUSCLE_GROUP_META = {
  chest:     { label: 'Chest',     color: '#ff6b35' },
  back:      { label: 'Back',      color: '#3a9eff' },
  shoulders: { label: 'Shoulders', color: '#b86bff' },
  biceps:    { label: 'Biceps',    color: '#4ade80' },
  triceps:   { label: 'Triceps',   color: '#f472b6' },
  legs:      { label: 'Legs',      color: '#d4ff3a' },
  core:      { label: 'Core',      color: '#fbbf24' },
  other:     { label: 'Other',     color: '#888888' }
};
