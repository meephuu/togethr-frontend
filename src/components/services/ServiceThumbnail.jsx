import { assetUrl } from "../../lib/assets";

// 96 × 60 cover thumbnail; gray placeholder when the service has no photo.
// Photos uploaded to the API come as /uploads/... paths on the API server.
export default function ServiceThumbnail({ url }) {
    if (!url) return <div className="h-[60px] w-24 shrink-0 rounded-lg bg-gray-200" aria-hidden="true" />;
    return <img src={assetUrl(url)} alt="" className="h-[60px] w-24 shrink-0 rounded-lg bg-gray-200 object-cover" />;
}
