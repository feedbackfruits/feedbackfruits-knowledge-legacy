let a: IVideo;

type URLString = string;

interface ILicenseable {
  license_logo_url: string;
  license_full_name: string;
  license_name: string;
  ka_user_license: string;
  license_url: string;
}

interface IVideo extends ILicenseable {
  id: string;
  sha: string;
  youtube_id: string;

  readable_id: string;
  slug: string;
  node_slug: string;
  relative_url: string;

  kind: string;
  content_kind: string;
  creation_date: string;
  date_added: string;

  title: string;
  description_html: string;
  author_names: string[];
  description: string;
  keywords: string;

  concept_tags_info: string[];
  assessment_item_tags: string[];
  clarifications_enabled: boolean;
  duration: number;
  download_size: number;

  ka_url: URLString;
  thumbnail_urls: {
    "default": URLString
    "filtered": URLString
  };
  download_urls: {
    "mp4": URLString
    "png": URLString
    "m3u8": URLString
  };

  translated_youtube_id: string;
  translated_title: string;
  translated_description_html: string;
  translated_youtube_lang: string;
  translated_description: string;
}
