import Link from "next/link";
import { type Course, MODE_LABEL, formatINR } from "@qschool/shared";

export function CourseCard({ course }: { course: Course & { cover?: string; subtitle?: string } }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {course.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={course.cover} alt="" className="h-36 w-full object-cover" />
      ) : (
        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-brand-deep to-[#032922]">
          <span className="px-4 text-center text-lg font-semibold text-white/90 group-hover:text-brand-teal500">{course.title}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <span className="chip">{course.category}</span>
          <span className="chip">{MODE_LABEL[course.mode]}</span>
        </div>
        <h3 className="mt-3 text-base font-semibold text-brand-deep">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-[#5c7772]">{course.subtitle || course.description}</p>
        <div className="mt-3 flex items-center gap-3 text-xs text-[#5c7772]">
          <span>★ {course.rating}</span>
          <span>{course.lessons} lessons</span>
          {course.durationHours > 0 && <span>{course.durationHours}h</span>}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#eef5f3] pt-4">
          <span className="text-lg font-bold text-brand-deep">{course.price ? formatINR(course.price) : "Free"}</span>
          <span className="text-sm font-semibold text-brand-teal group-hover:underline">View details →</span>
        </div>
      </div>
    </Link>
  );
}
