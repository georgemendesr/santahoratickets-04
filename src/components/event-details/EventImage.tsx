
interface EventImageProps {
  src: string;
  alt: string;
}

export function EventImage({ src, alt }: EventImageProps) {
  return (
    <div>
      <img
        src={src}
        alt={alt}
        className="w-full h-[400px] object-cover rounded-lg shadow-lg"
      />
    </div>
  );
}
