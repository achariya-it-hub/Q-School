// Student-experience mock data (Flutter port of packages/shared/src/student.ts).
// Replace with API calls once the NestJS backend exists — screens only read these shapes.

import 'package:flutter/material.dart';

enum UserRole { student, teacher, admin }

/// Currently active user role (student, teacher, admin)
final userRole = ValueNotifier<UserRole>(UserRole.student);

/// Artwork keys — each maps to a gradient + glyph (see widgets/kit.dart → ArtThumb).
enum Art { bulb, laptop, pencil, planet, leader, palette, robot, ai, heart, speech, python, leaf, building }

class ArtStyle {
  final Color from;
  final Color to;
  final Color accent;
  final IconData icon;
  const ArtStyle(this.from, this.to, this.accent, this.icon);
}

const Map<Art, ArtStyle> artStyles = {
  Art.bulb: ArtStyle(Color(0xFF0B2A3A), Color(0xFF1F5F6B), Color(0xFFFFC845), Icons.lightbulb_rounded),
  Art.laptop: ArtStyle(Color(0xFF1E3A5F), Color(0xFF3C7DBF), Color(0xFF9FD3FF), Icons.laptop_mac_rounded),
  Art.pencil: ArtStyle(Color(0xFF7A4A1F), Color(0xFFD98A3D), Color(0xFFFFE1B0), Icons.edit_note_rounded),
  Art.planet: ArtStyle(Color(0xFF0A1633), Color(0xFF2C3F8F), Color(0xFFFFB45C), Icons.rocket_launch_rounded),
  Art.leader: ArtStyle(Color(0xFF4A1E0F), Color(0xFFE0782F), Color(0xFFFFD27A), Icons.flag_rounded),
  Art.palette: ArtStyle(Color(0xFF6B2A6E), Color(0xFFE3648C), Color(0xFFFFE07A), Icons.palette_rounded),
  Art.robot: ArtStyle(Color(0xFF123B4E), Color(0xFF2D8FB0), Color(0xFFC8F3FF), Icons.smart_toy_rounded),
  Art.ai: ArtStyle(Color(0xFF1B1F3B), Color(0xFF4B4FA8), Color(0xFF9CE7FF), Icons.auto_awesome_rounded),
  Art.heart: ArtStyle(Color(0xFF5E1F3C), Color(0xFFD9668E), Color(0xFFFFD6E3), Icons.favorite_rounded),
  Art.speech: ArtStyle(Color(0xFF0F4C45), Color(0xFF2BB39C), Color(0xFFD7F0EB), Icons.mic_rounded),
  Art.python: ArtStyle(Color(0xFF1D3557), Color(0xFF2F7A3E), Color(0xFFFFE873), Icons.code_rounded),
  Art.leaf: ArtStyle(Color(0xFF164D2C), Color(0xFF4CAF6E), Color(0xFFD9F7C4), Icons.eco_rounded),
  Art.building: ArtStyle(Color(0xFF2F4A6B), Color(0xFF7FB2D9), Color(0xFFFFE9B8), Icons.apartment_rounded),
};

class Student {
  static const name = 'Ananya Sharma';
  static const firstName = 'Ananya';
  static const email = 'ananya@example.com';
  static const progress = 68;
  static const enrolled = 12;
  static const completed = 8;
  static const certificates = 4;
  static const hours = 32;
}

enum ProgramType { course, workshop, webinar, live }

class Program {
  final String slug;
  final String title;
  final ProgramType type;
  final String format;
  final int? lessons;
  final int? hours;
  final String? duration;
  final String? date;
  final double rating;
  final int ratings;
  final String? badge;
  final Art art;
  final String instructor;
  final String overview;
  final List<String> tags;
  final List<String> learn;
  final List<String> curriculum;

  const Program({
    required this.slug,
    required this.title,
    required this.type,
    required this.format,
    this.lessons,
    this.hours,
    this.duration,
    this.date,
    required this.rating,
    required this.ratings,
    this.badge,
    required this.art,
    required this.instructor,
    required this.overview,
    required this.tags,
    required this.learn,
    required this.curriculum,
  });

  bool get isEvent => type == ProgramType.workshop || type == ProgramType.webinar;

  String get typeLabel {
    switch (type) {
      case ProgramType.course:
        return 'Course';
      case ProgramType.workshop:
        return 'Workshop';
      case ProgramType.webinar:
        return 'Webinar';
      case ProgramType.live:
        return 'Live Class';
    }
  }
}

const programs = <Program>[
  Program(
    slug: 'design-thinking-for-young-minds',
    title: 'Design Thinking for Young Minds',
    type: ProgramType.course,
    format: 'Self-paced Course',
    lessons: 20,
    hours: 6,
    rating: 4.8,
    ratings: 1200,
    badge: 'Bestseller',
    art: Art.bulb,
    instructor: 'Meera Nair',
    overview:
        'Learn how to solve real world problems using design thinking. This course helps you develop creativity, empathy and innovation skills.',
    tags: ['Creativity', 'Problem Solving', 'Innovation'],
    learn: [
      'Understand design thinking process',
      'Work on real world projects',
      'Collaborate with peers',
      'Create your own solutions',
    ],
    curriculum: ['Empathise', 'Define the problem', 'Ideate', 'Prototype', 'Test & iterate'],
  ),
  Program(
    slug: 'coding-for-beginners',
    title: 'Coding for Beginners',
    type: ProgramType.course,
    format: 'Self-paced Course',
    lessons: 30,
    hours: 8,
    rating: 4.7,
    ratings: 856,
    art: Art.laptop,
    instructor: 'Rahul Verma',
    overview:
        'Start coding from scratch with block-based logic, then move to real code. Build small games and apps along the way.',
    tags: ['Logic', 'STEM', 'Projects'],
    learn: ['Think like a programmer', 'Loops, conditions and functions', 'Build three mini games', 'Debug your own code'],
    curriculum: ['Getting started', 'Logic & loops', 'Functions', 'Mini games', 'Final project'],
  ),
  Program(
    slug: 'creative-writing-workshop',
    title: 'Creative Writing Workshop',
    type: ProgramType.workshop,
    format: 'Live Workshop',
    duration: '2 Days',
    date: '15 Oct 2026',
    rating: 4.9,
    ratings: 420,
    art: Art.pencil,
    instructor: 'Kavya Iyer',
    overview: 'Two days of guided story-writing, poetry and feedback circles with a published author.',
    tags: ['Writing', 'Expression', 'Storytelling'],
    learn: ['Plan a short story', 'Write vivid descriptions', 'Give and take feedback', 'Publish to the class anthology'],
    curriculum: ['Ideas & prompts', 'Characters', 'Dialogue', 'Editing', 'Showcase'],
  ),
  Program(
    slug: 'science-explorers-webinar',
    title: 'Science Explorers Webinar',
    type: ProgramType.webinar,
    format: 'Live Webinar',
    duration: '1 Hour',
    date: '22 Oct 2026',
    rating: 4.8,
    ratings: 610,
    art: Art.planet,
    instructor: 'Dr. Arjun Rao',
    overview: 'A live tour of the solar system with experiments you can try at home.',
    tags: ['Science', 'Space', 'Curiosity'],
    learn: ['How planets form', 'Simple home experiments', 'Careers in space science', 'Live Q&A'],
    curriculum: ['Our solar system', 'Experiments', 'Q&A'],
  ),
  Program(
    slug: 'leadership-skills-for-students',
    title: 'Leadership Skills for Students',
    type: ProgramType.course,
    format: 'Self-paced Course',
    lessons: 25,
    hours: 7,
    rating: 4.7,
    ratings: 934,
    art: Art.leader,
    instructor: 'Sanjay Menon',
    overview: 'Build confidence, teamwork and decision-making through real school scenarios.',
    tags: ['Leadership', 'Teamwork', 'Confidence'],
    learn: ['Lead a team project', 'Communicate with confidence', 'Make decisions under pressure', 'Resolve conflicts'],
    curriculum: ['Know yourself', 'Communication', 'Teams', 'Decisions', 'Capstone'],
  ),
];

Program? findProgram(String? slug) {
  for (final p in programs) {
    if (p.slug == slug) return p;
  }
  return null;
}

class Enrollment {
  final String slug;
  final String title;
  final int done;
  final int total;
  final Art art;
  final bool completed;
  const Enrollment(this.slug, this.title, this.done, this.total, this.art, {this.completed = false});
  int get pct => (done / total * 100).round();
}

const enrollments = <Enrollment>[
  Enrollment('effective-communication', 'Effective Communication for Students', 16, 20, Art.speech),
  Enrollment('design-thinking-for-young-minds', 'Design Thinking for Young Minds', 12, 20, Art.bulb),
  Enrollment('coding-for-beginners', 'Coding for Beginners', 9, 30, Art.laptop),
  Enrollment('creative-writing-workshop', 'Creative Writing Workshop', 8, 8, Art.pencil, completed: true),
];

class Workshop {
  final String id;
  final String title;
  final String days;
  final String mode;
  final String? city;
  final String date;
  final int? seatsLeft;
  final Art art;
  final bool past;
  const Workshop(this.id, this.title, this.days, this.mode, this.date, this.art,
      {this.city, this.seatsLeft, this.past = false});
}

const workshops = <Workshop>[
  Workshop('ws1', 'Creative Writing Workshop', '2 Days', 'Online', '15 Oct - 16 Oct 2026', Art.pencil, seatsLeft: 45),
  Workshop('ws2', 'Art & Creativity Workshop', '1 Day', 'Offline', '22 Oct 2026', Art.palette, city: 'Chennai'),
  Workshop('ws3', 'Robotics Workshop', '2 Days', 'Offline', '5 Nov - 6 Nov 2026', Art.robot, city: 'Bangalore'),
  Workshop('ws4', 'Young Inventors Lab', '1 Day', 'Online', '12 Sep 2026', Art.bulb, past: true),
];

class Webinar {
  final String id;
  final String title;
  final String by;
  final String date;
  final String duration;
  final String registered;
  final Art art;
  final bool recorded;
  const Webinar(this.id, this.title, this.by, this.date, this.duration, this.registered, this.art,
      {this.recorded = false});
}

const webinars = <Webinar>[
  Webinar('wb1', 'Future of AI in Education', 'Dr. Rajesh Kumar', '12 Oct 2026', '1 Hour', '1.2K', Art.ai),
  Webinar('wb2', 'Mental Wellness for Students', 'Priya Sharma', '25 Oct 2026', '1 Hour', '856', Art.heart),
  Webinar('wb3', 'Space Exploration & Beyond', 'ISRO Expert', '28 Oct 2026', '1 Hour', '1.5K', Art.planet),
  Webinar('wb4', 'Study Smarter, Not Harder', 'Anil Kapoor', '18 Sep 2026', '45 Min', '2.1K', Art.bulb, recorded: true),
];

class LearningCenter {
  final String name;
  final String area;
  final String city;
  const LearningCenter(this.name, this.area, this.city);
}

const centers = <LearningCenter>[
  LearningCenter('Chennai Learning Center', 'Anna Nagar', 'Chennai'),
  LearningCenter('Bangalore Learning Center', 'Indiranagar', 'Bangalore'),
  LearningCenter('Hyderabad Learning Center', 'Madhapur', 'Hyderabad'),
];

class Certificate {
  final String title;
  final String completed;
  const Certificate(this.title, this.completed);
}

const certificates = <Certificate>[
  Certificate('Design Thinking for Young Minds', '12 Sep 2026'),
  Certificate('Creative Writing Workshop', '20 Aug 2026'),
  Certificate('Effective Communication', '15 Jul 2026'),
  Certificate('Public Speaking Basics', '02 Jun 2026'),
];

class HubItem {
  final String label;
  final IconData icon;
  final Color from;
  final Color to;
  final String route;
  const HubItem(this.label, this.icon, this.from, this.to, this.route);
}

/// `route` is a named route, or `tab:N` to switch the bottom tab.
const hub = <HubItem>[
  HubItem('Courses', Icons.menu_book_rounded, Color(0xFFFF9A3D), Color(0xFFF2652B), 'tab:2'),
  HubItem('Live Classes', Icons.live_tv_rounded, Color(0xFFFF6B6B), Color(0xFFE0313B), '/live'),
  HubItem('Workshops', Icons.palette_rounded, Color(0xFFB57BFF), Color(0xFF7C3AED), '/workshops'),
  HubItem('Webinars', Icons.co_present_rounded, Color(0xFF2FD1B5), Color(0xFF0E937E), '/webinars'),
  HubItem('Offline Classes', Icons.apartment_rounded, Color(0xFF5AA9FF), Color(0xFF2563EB), '/offline'),
  HubItem('Certifications', Icons.workspace_premium_rounded, Color(0xFFFFC24A), Color(0xFFF59E0B), '/certificates'),
  HubItem('Assessments', Icons.assignment_turned_in_rounded, Color(0xFF4FC3F7), Color(0xFF0284C7), 'tab:1'),
  HubItem('Community', Icons.groups_rounded, Color(0xFFE879F9), Color(0xFFA21CAF), 'tab:3'),
];

class ChatMessage {
  final String who;
  final String time;
  final String text;
  const ChatMessage(this.who, this.time, this.text);
}

class LiveSession {
  static const title = 'Design Thinking for Young Minds';
  static const host = 'Meera Nair';
  static const viewers = 245;
  static const chat = <ChatMessage>[
    ChatMessage('Riya', '10:02 AM', 'This is very useful!'),
    ChatMessage('Aarav', '10:03 AM', 'Can you explain this again?'),
    ChatMessage('Instructor', '10:03 AM', 'Sure, let me explain with an example.'),
    ChatMessage('Kavya', '10:04 AM', 'Great session! 👍'),
    ChatMessage('Vikram', '10:04 AM', 'Will the recording be available?'),
  ];
}

class NextLive {
  static const title = 'Science for a Sustainable Future';
  static const when = 'Today, 5:00 PM - 6:00 PM';
}

class Post {
  final String id;
  final String who;
  final String when;
  final String text;
  final int likes;
  final int replies;
  const Post(this.id, this.who, this.when, this.text, this.likes, this.replies);
}

const posts = <Post>[
  Post('p1', 'Riya Patel', '2h ago', 'Just finished my first design-thinking prototype — a reusable lunchbox planner! 🎉', 48, 12),
  Post('p2', 'Aarav Singh', '5h ago', 'Anyone up for a study group on Python loops this weekend?', 21, 9),
  Post('p3', 'Kavya Iyer', '1d ago', 'Sharing my notes from the Science Explorers webinar 🚀', 76, 18),
];

String fmtCount(int n) {
  if (n < 1000) return '$n';
  final k = (n / 1000).toStringAsFixed(1);
  return '${k.endsWith('.0') ? k.substring(0, k.length - 2) : k}K';
}
