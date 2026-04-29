import Image from "next/image";
import { Github } from "lucide-react";
import type { TeamMember } from "@/lib/db/schema";

const gridClasses =
  "mx-auto mt-20 grid w-full max-w-(--breakpoint-lg) grid-cols-2 gap-12 sm:grid-cols-3 md:grid-cols-4";

type TeamProps = {
  members: TeamMember[];
};

const Team = ({ members }: TeamProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl text-center">
        <b className="text-center font-semibold text-muted-foreground text-sm uppercase">
          Who We Are
        </b>
        <h2 className="mt-4 font-semibold text-4xl tracking-tighter sm:text-5xl">
          Meet The Contributors
        </h2>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          A passionate student team dedicated to the best SEU experience.
        </p>
      </div>

      {members.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground text-sm">
          Team profiles will appear here soon.
        </p>
      ) : (
        <div className={gridClasses}>
          {members.map((member) => (
            <div className="text-center" key={member.id}>
              <div className="relative mx-auto h-20 w-20">
                <Image
                  alt={member.name}
                  className="rounded-full bg-secondary object-cover"
                  fill
                  sizes="80px"
                  src={member.imageUrl}
                  unoptimized
                />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{member.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
              <p className="text-xs text-muted-foreground">{member.batch}</p>
              {member.githubUrl ? (
                <a
                  className="mt-2 inline-flex items-center justify-center gap-1 text-sm text-primary hover:underline"
                  href={member.githubUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github className="size-4" />
                  GitHub
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Team;
