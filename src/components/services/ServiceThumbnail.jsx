// 96 × 60 cover thumbnail; gray placeholder when the service has no photo.
export default function ServiceThumbnail({ url }) {
    if (!url) return <div className="h-[60px] w-24 shrink-0 rounded-lg bg-gray-200" aria-hidden="true" />;
    return <img src={url} alt="" className="h-[60px] w-24 shrink-0 rounded-lg bg-gray-200 object-cover" />;
}
