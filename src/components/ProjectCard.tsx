import Image from 'next/image';
import Button from './Button';

interface ProjectCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
  projectUrl?: string;
  githubUrl?: string;
}

export default function ProjectCard({
  title,
  description,
  imageUrl,
  tags = [],
  projectUrl,
  githubUrl,
}: ProjectCardProps) {
  return (
    <div className="bg-modules rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Project Image */}
      {imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-darkest-blue mb-2">{title}</h3>
        <p className="text-grey-text mb-4">{description}</p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium bg-clickable text-primary-text rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {projectUrl && (
            <a href={projectUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="sm">
                View Project
              </Button>
            </a>
          )}
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                GitHub
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
