import { truncate } from "@/lib/text";
import { getDictionary } from "@/lib/i18n/server";

export type PlaylistItem = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
};

export async function PlaylistPanel({
  items,
  error,
}: {
  items: PlaylistItem[];
  error?: boolean;
}) {
  const dict = await getDictionary();

  return (
    <div className="panel">
      <p className="panel-title">{dict.playlistPanel.title(items.length)}</p>
      {error ? (
        <p className="error-text">{dict.playlistPanel.error}</p>
      ) : items.length === 0 ? (
        <p className="hint-text">{dict.playlistPanel.empty}</p>
      ) : (
        <ul className="bullet-list no-bullet">
          {items.map((item) => (
            <li
              key={item.videoId}
              className="row"
              style={{ alignItems: "flex-start", marginBottom: 8 }}
            >
              <a
                href={`https://www.youtube.com/watch?v=${item.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flexShrink: 0 }}
              >
                <img
                  src={item.thumbnailUrl}
                  alt=""
                  width={112}
                  height={63}
                  style={{ border: "1px solid var(--border)", objectFit: "cover", display: "block" }}
                />
              </a>
              <span style={{ minWidth: 0, flex: 1 }}>
                <a
                  href={`https://www.youtube.com/watch?v=${item.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.title}
                >
                  {truncate(item.title, 40)}
                </a>
                <br />
                <span className="hint-text">{item.channelTitle}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
