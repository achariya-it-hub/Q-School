import 'package:flutter/material.dart';

import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});
  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  int _f = 0;
  final Set<String> _liked = {};

  @override
  Widget build(BuildContext context) {
    return QSPage(
      title: 'Community',
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: QS.line),
          ),
          child: Row(
            children: [
              const Avatar(name: Student.name, size: 38),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  style: const TextStyle(fontSize: 13, color: QS.ink),
                  decoration: const InputDecoration(
                    hintText: 'Share something with your peers...',
                    hintStyle: TextStyle(color: Color(0xFF8A9C97), fontSize: 13),
                  ),
                ),
              ),
              const Icon(Icons.image_outlined, color: QS.teal, size: 22),
            ],
          ),
        ),
        const SizedBox(height: 14),
        FilterChips(
          items: const ['For You', 'Study Groups', 'Projects', 'Q&A'],
          value: _f,
          onChanged: (i) => setState(() => _f = i),
        ),
        const SizedBox(height: 14),
        for (final p in posts) _PostCard(
          post: p,
          liked: _liked.contains(p.id),
          onLike: () => setState(() => _liked.contains(p.id) ? _liked.remove(p.id) : _liked.add(p.id)),
        ),
      ],
    );
  }
}

class _PostCard extends StatelessWidget {
  const _PostCard({required this.post, required this.liked, required this.onLike});
  final Post post;
  final bool liked;
  final VoidCallback onLike;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: QS.line)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Avatar(name: post.who, size: 38),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(post.who, style: const TextStyle(fontWeight: FontWeight.w700, color: QS.ink, fontSize: 13.5)),
                    Text(post.when, style: const TextStyle(fontSize: 11, color: QS.sub)),
                  ],
                ),
              ),
              const Icon(Icons.more_horiz_rounded, color: QS.sub),
            ],
          ),
          const SizedBox(height: 10),
          Text(post.text, style: const TextStyle(color: Color(0xFF26403A), fontSize: 13.5, height: 1.5)),
          const SizedBox(height: 12),
          Row(
            children: [
              GestureDetector(
                onTap: onLike,
                child: Row(
                  children: [
                    Icon(liked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                        size: 20, color: liked ? QS.red : QS.sub),
                    const SizedBox(width: 6),
                    Text('${post.likes + (liked ? 1 : 0)}', style: const TextStyle(fontSize: 12, color: QS.sub)),
                  ],
                ),
              ),
              const SizedBox(width: 22),
              const Icon(Icons.chat_bubble_outline_rounded, size: 18, color: QS.sub),
              const SizedBox(width: 6),
              Text('${post.replies}', style: const TextStyle(fontSize: 12, color: QS.sub)),
              const SizedBox(width: 22),
              const Icon(Icons.share_outlined, size: 18, color: QS.sub),
            ],
          ),
        ],
      ),
    );
  }
}
