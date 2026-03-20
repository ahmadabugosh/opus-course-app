type VideoEmbedProps = {
  url: string;
  title: string;
};

function isLocalVideo(url: string): boolean {
  return url.startsWith('/') && (url.endsWith('.mp4') || url.endsWith('.webm'));
}

function toEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return url;
  } catch {
    return url;
  }
}

export default function VideoEmbed({ url, title }: VideoEmbedProps) {
  if (isLocalVideo(url)) {
    return (
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-sm">
        <video
          controls
          preload="metadata"
          className="w-full"
          title={title}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  const embedUrl = toEmbedUrl(url);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-sm">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export { toEmbedUrl };
