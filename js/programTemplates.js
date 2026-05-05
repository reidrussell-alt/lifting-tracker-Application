import { EXERCISE_LIBRARY } from './exerciseLibrary.js';

function ex(id, sets) {
  const found = EXERCISE_LIBRARY.find(e => e.id === id);
  if (!found) return null;
  return { ...found, sets };
}

export const PROGRAM_TEMPLATES = [
  {
    id: 'template_3day_fullbody',
    name: '3-Day Full Body',
    description: 'Train your entire body 3 times per week. Great for beginners or those with limited time.',
    daysPerWeek: 3,
    days: [
      {
        id: 'day1', name: 'Full Body A',
        exercises: [ex('squat',4), ex('bench_press',4), ex('barbell_row',4), ex('db_shoulder_press',3), ex('barbell_curl',3), ex('tricep_pushdown',3)].filter(Boolean)
      },
      {
        id: 'day2', name: 'Full Body B',
        exercises: [ex('deadlift',3), ex('incline_bench',4), ex('lat_pulldown',4), ex('lateral_raise',3), ex('leg_curl',3), ex('plank',3)].filter(Boolean)
      },
      {
        id: 'day3', name: 'Full Body C',
        exercises: [ex('front_squat',4), ex('db_press',4), ex('pullups',3), ex('ohp',3), ex('rdl',3), ex('cable_crunch',3)].filter(Boolean)
      }
    ]
  },

  {
    id: 'template_4day_upper_lower',
    name: '4-Day Upper/Lower',
    description: 'Train upper body twice and lower body twice per week. Balanced approach for intermediate lifters.',
    daysPerWeek: 4,
    days: [
      {
        id: 'upper1', name: 'Upper A',
        exercises: [ex('bench_press',4), ex('barbell_row',4), ex('db_shoulder_press',3), ex('lat_pulldown',3), ex('barbell_curl',3), ex('tricep_pushdown',3)].filter(Boolean)
      },
      {
        id: 'lower1', name: 'Lower A',
        exercises: [ex('squat',4), ex('rdl',4), ex('leg_press',3), ex('leg_curl',3), ex('standing_calf_raise',4), ex('plank',3)].filter(Boolean)
      },
      {
        id: 'upper2', name: 'Upper B',
        exercises: [ex('incline_bench',4), ex('db_row',4), ex('ohp',3), ex('pullups',3), ex('hammer_curl',3), ex('overhead_tricep_ext',3)].filter(Boolean)
      },
      {
        id: 'lower2', name: 'Lower B',
        exercises: [ex('deadlift',3), ex('bulgarian_split_squat',3), ex('leg_extension',3), ex('seated_leg_curl',3), ex('hip_thrust',4), ex('hanging_leg_raise',3)].filter(Boolean)
      }
    ]
  },

  {
    id: 'template_4day_ppl_upper',
    name: "4-Day Push/Pull/Legs/Upper",
    description: "Reid's current split. Push, pull, legs, then an upper body focus day.",
    daysPerWeek: 4,
    days: [
      {
        id: 'upperA', name: 'Upper A - Push',
        exercises: [ex('db_press',4), ex('incline_db_press',3), ex('cable_fly',3), ex('lateral_raise',3), ex('tricep_pushdown',3), ex('overhead_tricep_ext',3)].filter(Boolean)
      },
      {
        id: 'lowerA', name: 'Lower A - Quad Focus',
        exercises: [ex('squat',4), ex('leg_press',4), ex('leg_extension',3), ex('leg_curl',3), ex('standing_calf_raise',4), ex('plank',3)].filter(Boolean)
      },
      {
        id: 'upperB', name: 'Upper B - Pull',
        exercises: [ex('barbell_row',4), ex('lat_pulldown',4), ex('db_row',3), ex('face_pulls',3), ex('barbell_curl',3), ex('hammer_curl',3)].filter(Boolean)
      },
      {
        id: 'lowerB', name: 'Lower B - Posterior Chain',
        exercises: [ex('deadlift',3), ex('rdl',3), ex('hip_thrust',4), ex('seated_leg_curl',3), ex('seated_calf_raise',4), ex('cable_crunch',3)].filter(Boolean)
      }
    ]
  },

  {
    id: 'template_5day_ppl',
    name: '5-Day Push/Pull/Legs',
    description: 'Push, pull, legs, upper, lower. Great for advanced lifters wanting higher volume.',
    daysPerWeek: 5,
    days: [
      {
        id: 'push', name: 'Push',
        exercises: [ex('bench_press',4), ex('incline_bench',4), ex('db_shoulder_press',3), ex('lateral_raise',3), ex('tricep_pushdown',3), ex('overhead_tricep_ext',3)].filter(Boolean)
      },
      {
        id: 'pull', name: 'Pull',
        exercises: [ex('deadlift',3), ex('barbell_row',4), ex('lat_pulldown',4), ex('face_pulls',3), ex('barbell_curl',3), ex('hammer_curl',3)].filter(Boolean)
      },
      {
        id: 'legs', name: 'Legs',
        exercises: [ex('squat',4), ex('rdl',4), ex('leg_press',3), ex('leg_curl',3), ex('standing_calf_raise',4), ex('plank',3)].filter(Boolean)
      },
      {
        id: 'upper', name: 'Upper',
        exercises: [ex('incline_db_press',4), ex('db_row',4), ex('ohp',3), ex('cable_row',3), ex('dips_chest',3), ex('pullups',3)].filter(Boolean)
      },
      {
        id: 'lower', name: 'Lower',
        exercises: [ex('front_squat',4), ex('bulgarian_split_squat',3), ex('leg_extension',3), ex('seated_leg_curl',3), ex('hip_thrust',4), ex('hanging_leg_raise',3)].filter(Boolean)
      }
    ]
  },

  {
    id: 'template_6day_ppl_2x',
    name: '6-Day Push/Pull/Legs (2×/week)',
    description: 'Push, pull, legs repeated twice per week. High volume for advanced lifters.',
    daysPerWeek: 6,
    days: [
      {
        id: 'push1', name: 'Push A',
        exercises: [ex('bench_press',4), ex('incline_db_press',4), ex('cable_fly',3), ex('db_shoulder_press',3), ex('lateral_raise',3), ex('tricep_pushdown',3)].filter(Boolean)
      },
      {
        id: 'pull1', name: 'Pull A',
        exercises: [ex('deadlift',3), ex('barbell_row',4), ex('lat_pulldown',4), ex('db_row',3), ex('barbell_curl',3), ex('hammer_curl',3)].filter(Boolean)
      },
      {
        id: 'legs1', name: 'Legs A',
        exercises: [ex('squat',4), ex('leg_press',4), ex('leg_extension',3), ex('rdl',3), ex('leg_curl',3), ex('standing_calf_raise',4)].filter(Boolean)
      },
      {
        id: 'push2', name: 'Push B',
        exercises: [ex('incline_bench',4), ex('db_press',4), ex('pec_deck',3), ex('ohp',3), ex('cable_lateral_raise',3), ex('overhead_tricep_ext',3)].filter(Boolean)
      },
      {
        id: 'pull2', name: 'Pull B',
        exercises: [ex('pullups',4), ex('tbar_row',4), ex('cable_row',3), ex('face_pulls',3), ex('cable_curl',3), ex('preacher_curl',3)].filter(Boolean)
      },
      {
        id: 'legs2', name: 'Legs B',
        exercises: [ex('front_squat',4), ex('bulgarian_split_squat',3), ex('hack_squat',3), ex('seated_leg_curl',3), ex('hip_thrust',4), ex('seated_calf_raise',4)].filter(Boolean)
      }
    ]
  },

  {
    id: 'template_5day_bro_split',
    name: '5-Day Bro Split',
    description: 'Classic bodybuilding split: chest, back, shoulders, arms, legs.',
    daysPerWeek: 5,
    days: [
      {
        id: 'chest', name: 'Chest',
        exercises: [ex('bench_press',4), ex('incline_bench',4), ex('incline_db_press',3), ex('cable_fly',3), ex('pec_deck',3), ex('dips_chest',3)].filter(Boolean)
      },
      {
        id: 'back', name: 'Back',
        exercises: [ex('deadlift',3), ex('barbell_row',4), ex('lat_pulldown',4), ex('db_row',3), ex('cable_row',3), ex('pullups',3)].filter(Boolean)
      },
      {
        id: 'shoulders', name: 'Shoulders',
        exercises: [ex('ohp',4), ex('db_shoulder_press',4), ex('lateral_raise',4), ex('front_raise',3), ex('rear_delt_fly',3), ex('face_pulls',3)].filter(Boolean)
      },
      {
        id: 'arms', name: 'Arms',
        exercises: [ex('barbell_curl',4), ex('close_grip_bench',4), ex('hammer_curl',3), ex('tricep_pushdown',3), ex('preacher_curl',3), ex('skull_crushers',3)].filter(Boolean)
      },
      {
        id: 'legs_bro', name: 'Legs',
        exercises: [ex('squat',4), ex('rdl',4), ex('leg_press',3), ex('leg_extension',3), ex('leg_curl',3), ex('standing_calf_raise',4)].filter(Boolean)
      }
    ]
  }
];

export function getTemplateById(id) {
  return PROGRAM_TEMPLATES.find(t => t.id === id);
}
