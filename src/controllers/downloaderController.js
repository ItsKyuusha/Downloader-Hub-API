const axios = require("axios");

exports.downloadTikTokVideo = async (req, res) => {
  const { url } = req.query;

  console.log("TikTok Video Download Request URL:", url);

  if (!url) {
    console.log("TikTok URL not provided");
    return res.status(400).json({ status: false, message: "URL diperlukan" });
  }

  try {
    const response = await axios.post(
      process.env.TIKTOK_API_URL,
      new URLSearchParams({
        id: url,
        locale: "en",
        tt: "RHJHcms_",
      }).toString(),
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      }
    );

    const html = response.data;
    const nowmMatch = html.match(
      /<a href="(https:\/\/tikcdn\.io\/ssstik\/[^"]+)"[^>]*without_watermark[^>]*>/
    );
    const downloadTiktokNowm = nowmMatch ? nowmMatch[1] : null;

    const mp3Match = html.match(
      /<a href="(https:\/\/tikcdn\.io\/ssstik\/[^"]+)"[^>]*music[^>]*>/
    );
    const downloadTiktokMp3 = mp3Match ? mp3Match[1] : null;

    const imgMatch = html.match(
      /<img class="result_author" src="([^"]+)" alt="([^"]+)">/
    );
    const creatorProfileImg = imgMatch ? imgMatch[1] : null;
    const creatorUsername = imgMatch ? imgMatch[2] : null;

    const descriptionMatch = html.match(/<p class="maintext">([^<]+)<\/p>/);
    const videoDescription = descriptionMatch ? descriptionMatch[1] : null;

    console.log("Download Links:", { downloadTiktokNowm, downloadTiktokMp3 });
    console.log("Creator Info:", {
      creatorProfileImg,
      creatorUsername,
      videoDescription,
    }); // Debug: Log creator info

    if (!downloadTiktokNowm && !downloadTiktokMp3) {
      console.log("No download links found");
      return res
        .status(404)
        .json({ status: false, message: "Gagal menemukan tautan unduhan" });
    }

    return res.status(200).json({
      status: true,
      message: "Tautan unduhan ditemukan",
      data: [
        {
          downloadTiktokNowm,
          downloadTiktokMp3,
          creatorProfileImg,
          creatorUsername,
          videoDescription,
        },
      ],
    });
  } catch (error) {
    console.error("Error downloading TikTok video:", error);
    return res.status(500).json({
      status: false,
      message: "Gagal mengunduh video",
      error: error.message,
    });
  }
};

exports.downloadInstagramStory = async (req, res) => {
  const { url } = req.query;

  console.log("Instagram Story Download Request URL:", url);

  if (!url) {
    console.log("Instagram Story URL not provided");
    return res
      .status(400)
      .json({ status: false, message: "URL Instagram diperlukan" });
  }

  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_STORY_API_URL}${url}`
    );
    console.log("Instagram Story API Response:", response.data); // Debug: Log API response

    const result = response.data.result[0];
    if (result.video_versions && result.video_versions[0]) {
      const videoUrl = result.video_versions[0].url;
      console.log("Instagram Story Video URL:", videoUrl); // Debug: Log video URL
      return res.status(200).json({
        status: true,
        message: "Tautan unduhan Instagram Story ditemukan",
        data: {
          videoUrl,
        },
      });
    } else if (result.image_versions2 && result.image_versions2.candidates[0]) {
      const imageUrl = result.image_versions2.candidates[0].url;
      console.log("Instagram Story Image URL:", imageUrl); // Debug: Log image URL
      return res.status(200).json({
        status: true,
        message: "Tautan unduhan Instagram Story ditemukan",
        data: {
          imageUrl,
        },
      });
    } else {
      console.log("No Instagram Story download links found");
      return res.status(404).json({
        status: false,
        message: "Gagal menemukan tautan unduhan Instagram Story",
      });
    }
  } catch (error) {
    console.error("Error downloading Instagram Story:", error);
    return res.status(500).json({
      status: false,
      message: "Gagal mengunduh Instagram Story",
      error: error.message,
    });
  }
};

exports.downloadInstagramPost = async (req, res) => {
  const { url } = req.query;

  console.log("Instagram Post Download Request URL:", url);

  if (!url) {
    console.log("Instagram Post URL not provided");
    return res
      .status(400)
      .json({ status: false, message: "URL Instagram diperlukan" });
  }

  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_POST_API_URL}${url}`
    );
    const result = response.data;
    let posts = [];

    if (Array.isArray(result) && result.length > 0) {
      posts = result.map((post) => ({
        thumbnail_img: post.thumbnail,
        urldownload_img: post.newUrl,
      }));
      console.log("Instagram Post Data (Array):", posts); // Debug: Log post data array
    } else if (result && result.thumbnail && result.newUrl) {
      posts.push({
        thumbnail_img: result.thumbnail,
        urldownload_img: result.newUrl,
      });
      console.log("Instagram Post Data (Single):", posts); // Debug: Log single post data
    } else {
      console.log("No Instagram Post download links found");
      return res.status(404).json({
        status: false,
        message: "Gagal menemukan tautan unduhan Instagram Post",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Tautan unduhan Instagram Post ditemukan",
      data: posts,
    });
  } catch (error) {
    console.error("Error downloading Instagram Post:", error);
    return res.status(500).json({
      status: false,
      message: "Gagal mengunduh Instagram Post",
      error: error.message,
    });
  }
};

exports.downloadFacebookPost = async (req, res) => {
  const { url } = req.query;

  console.log("Facebook Post Download Request URL:", url);

  if (!url) {
    console.log("Facebook Post URL not provided");
    return res
      .status(400)
      .json({ status: false, message: "URL Facebook diperlukan" });
  }

  try {
    const response = await axios.get(
      `${process.env.FACEBOOK_POST_API_URL}${url}`
    );
    const result = response.data;

    if (!result.sd && !result.hd) {
      console.log("No Facebook Post download links found");
      return res.status(404).json({
        status: false,
        message: "Gagal menemukan tautan unduhan Facebook Post",
      });
    }

    console.log("Facebook Post Download Links:", {
      sdUrl: result.sd,
      hdUrl: result.hd,
    });

    return res.status(200).json({
      status: true,
      message: "Tautan unduhan Facebook Post ditemukan",
      data: {
        sdUrl: result.sd,
        hdUrl: result.hd,
        thumbnail: result.thumbnail,
        title: result.title,
      },
    });
  } catch (error) {
    console.error("Error downloading Facebook Post:", error);
    return res.status(500).json({
      status: false,
      message: "Gagal mengunduh Facebook Post",
      error: error.message,
    });
  }
};

exports.downloadYoutubePost = async (req, res) => {
  const { url } = req.query;

  console.log("YouTube Post Download Request URL:", url);

  if (!url) {
    console.log("YouTube URL not provided");
    return res
      .status(400)
      .json({ status: false, message: "URL YouTube diperlukan" });
  }

  try {
    const data = JSON.stringify({ url });
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.YOUTUBE_API_URL,
      headers: { "Content-Type": "application/json" },
      data: data,
    };

    const response = await axios.request(config);
    const result = response.data;

    if (!result || !result.formats || result.formats.length === 0) {
      console.log("No YouTube download links found");
      return res
        .status(404)
        .json({
          status: false,
          message: "Gagal menemukan tautan unduhan YouTube",
        });
    }

    // Filter formats for video_with_audio and m4a audio
    const videoFormats = result.formats.filter(
      (format) => format.type === "video_with_audio"
    );
    const audioFormats = result.formats.filter(
      (format) => format.ext === "m4a"
    );

    // Extract URLs
    const videoUrls = videoFormats.map((format) => ({
      formatId: format.formatId,
      label: format.label,
      url: format.url,
      mimeType: format.mimeType,
      duration: format.duration,
    }));

    const audioUrls = audioFormats.map((format) => ({
      formatId: format.formatId,
      label: format.label,
      url: format.url,
      mimeType: format.mimeType,
      duration: format.duration,
    }));

    console.log("Filtered YouTube Video Links:", videoUrls);
    console.log("Filtered YouTube Audio Links (m4a):", audioUrls);

    return res.status(200).json({
      status: true,
      message: "Tautan unduhan YouTube ditemukan",
      data: {
        thumbnailUrl: result.thumbnailUrl,
        title: result.title,
        duration: result.duration,
        videoUrls: videoUrls,
        audioUrls: audioUrls,
      },
    });
  } catch (error) {
    console.error("Error downloading YouTube Post:", error);
    return res.status(500).json({
      status: false,
      message: "Gagal mengunduh YouTube Post",
      error: error.message,
    });
  }
};

exports.downloadTwitterPost = async (req, res) => {
  const { url } = req.query;

  console.log("Twitter Post Download Request URL:", url);

  if (!url) {
    console.log("Twitter URL not provided");
    return res
      .status(400)
      .json({ status: false, message: "URL Twitter diperlukan" });
  }

  try {
    const data = { q: url };
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.TWITTER_API_URL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    const response = await axios.request(config);
    const result = response.data;

    if (!result || !result.data) {
      console.log("No Twitter download links found");
      return res
        .status(404)
        .json({
          status: false,
          message: "Gagal menemukan tautan unduhan Twitter",
        });
    }

    // Extracting the necessary information from the HTML data
    const htmlData = result.data;

    // Extract the first MP4 download link
    const downloadLinkMatch = htmlData.match(
      /<a[^>]*href="([^"]*)"[^>]*>.*?Download MP4\s*\(.*?\)<\/a>/
    );
    const downloadLink = downloadLinkMatch ? downloadLinkMatch[1] : null;

    // Extract the thumbnail URL
    const thumbnailMatch = htmlData.match(/<img[^>]*src="([^"]*)"[^>]*>/);
    const thumbnailUrl = thumbnailMatch ? thumbnailMatch[1] : null;

    // Extract the video description
    const descriptionMatch = htmlData.match(/<h3>(.*?)<\/h3>/);
    const videoDescription = descriptionMatch ? descriptionMatch[1] : null;

    // Extract the audio URL from the "Convert to MP3" link
    const audioUrlMatch = htmlData.match(/data-audioUrl="([^"]*)"/);
    const audioUrl = audioUrlMatch ? audioUrlMatch[1] : null;

    if (!downloadLink) {
      console.log("No MP4 download link found");
      return res
        .status(404)
        .json({ status: false, message: "Gagal menemukan tautan unduhan MP4" });
    }

    console.log("Filtered Twitter Video Download Link:", downloadLink);
    console.log("Video Description:", videoDescription);

    return res.status(200).json({
      status: true,
      message: "Tautan unduhan Twitter ditemukan",
      data: {
        vidUrl: downloadLink,
        vidDescription: videoDescription,
        audioUrl: audioUrl,
        thumbnailUrl: thumbnailUrl,
      },
    });
  } catch (error) {
    console.error("Error downloading Twitter Post:", error);
    return res.status(500).json({
      status: false,
      message: "Gagal mengunduh Twitter Post",
      error: error.message,
    });
  }
};
exports.tiktokDownloaderv2 = async (req, res) => {
  let { url } = req.query;

  console.log("TikTok Video v2 Download Request URL:", url);

  // Resolusi tautan pendek jika ada
  const resolveShortUrl = async (shortUrl) => {
    try {
      const response = await axios.get(shortUrl, {
        maxRedirects: 0, // Jangan mengikuti redirect
        validateStatus: (status) => status >= 300 && status < 400, // Tangkap status redirect
      });

      const longUrl = response.headers.location; // Ambil URL tujuan dari header
      console.log("Resolved long URL:", longUrl);
      return longUrl;
    } catch (error) {
      console.error("Error resolving short URL:", error.message);
      return null;
    }
  };

  // Cek jika URL adalah tautan pendek (seperti yang dimulai dengan 'https://vt.tiktok.com/')
  if (url && url.includes("vt.tiktok.com")) {
    url = await resolveShortUrl(url); // Resolusi ke URL panjang
  }

  // Cek jika URL valid dan mengandung 'video/' untuk mengambil ID
  if (url && url.includes("video/")) {
    url = url.split("video/")[1].split("?")[0]; // Ambil ID setelah "video/" dan buang parameter setelah '?'
  }

  console.log("Extracted TikTok Video ID:", url);

  if (!url) {
    console.log("TikTok video URL not provided or invalid");
    return res.status(400).json({ status: false, message: "URL TikTok tidak valid atau diperlukan" });
  }

  try {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${process.env.TIKTOKV2_API_URL}${url}`, // Gunakan ID video yang diekstrak
      headers: {},
    };

    const response = await axios.request(config);
    const {
      user: {
        username = "Unknown",
        name = "Unknown",
        image = null,
        image_small = null,
      } = {},
      video_no_watermark: {
        url: videoNoWatermarkUrl = null,
        size_mb: videoNoWatermarkSize = null,
        width = null,
        height = null,
      } = {},
      video_watermark: { url: videoWatermarkUrl = null } = {},
      thumbnail = null,
      thumbnail_animated = null,
      video_duration_seconds = null,
      audio: {
        url: audioUrl = null,
        duration_seconds: audioDuration = null,
      } = {},
    } = response.data || {};

    return res.status(200).json({
      status: true,
      message: "Tautan unduhan TikTok v2 ditemukan",
      data: {
        user: {
          username,
          name,
          image,
        },
        video_no_watermark: {
          url: videoNoWatermarkUrl,
        },
        video_watermark: {
          url: videoWatermarkUrl,
        },
        thumbnail,
        audio: {
          url: audioUrl,
        },
      },
    });
  } catch (error) {
    console.error("Error downloading TikTok v2 video:", error.message);
    return res.status(500).json({
      status: false,
      message: "Gagal mengunduh video TikTok v2",
      error: error.message,
    });
  }
};

exports.downloadTwitterPhoto = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ status: false, message: "URL diperlukan" });
  }

  try {
    // Make the POST request to the external API
    const response = await axios.post("https://savetwitter.net/api/ajaxSearch", `q=${encodeURIComponent(url)}&lang=id`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "x-requested-with": "XMLHttpRequest",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        origin: "https://savetwitter.net",
        referer: "https://savetwitter.net/id",
      },
    });

    // Extract the HTML content from the response
    const htmlContent = response.data.data;

    // Use a regular expression to find all image URLs within <img src="...">
    const imageUrls = [...htmlContent.matchAll(/<img src="([^"]+)" alt="savetwitter">/g)].map(match => match[1]);

    if (imageUrls.length > 0) {
      return res.status(200).json({
        status: true,
        message: "Tautan unduhan foto Twitter ditemukan",
        data: { imageUrls },
      });
    } else {
      return res.status(404).json({
        status: false,
        message: "Gagal menemukan tautan unduhan Twitter",
      });
    }
  } catch (error) {
    console.error("Error fetching Twitter media:", error);
    return res.status(500).json({
      status: false,
      message: "Gagal mengunduh media Twitter",
      error: error.message,
    });
  }
};

exports.downloadInstagramPhotos = async (req, res) => {
  const { url } = req.query;

  console.log("Instagram Photo Download Request URL:", url);

  if (!url) {
    console.log("Instagram URL not provided");
    return res
      .status(400)
      .json({ status: false, message: "URL Instagram diperlukan" });
  }

  try {
    // Setup the POST request data and headers
    const data = new URLSearchParams({
      link: url,
      downloader: 'photo',
    });
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: 'https://indownloader.app/request',
      headers: {
        'Host': 'indownloader.app',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://indownloader.app',
        'Connection': 'keep-alive',
        'Referer': 'https://indownloader.app/',
        'Cookie': 'PHPSESSID=uinr7u5fj2p71kv5mf9ac20a4r; _ga_W9Q84JYKKD=GS1.1.1732029872.1.0.1732029880.0.0.0; _ga=GA1.1.246517339.1732029873; __gads=ID=89262965695dd213:T=1732029872:RT=1732029872:S=ALNI_MZdNUobLmP6ZnD2eNArfihYeCuC1g; __gpi=UID=00000f6e66184b7d:T=1732029872:RT=1732029872:S=ALNI_MacvLLL85NmlfeGLX-aSm5VTlqVdg; __eoi=ID=75b8e5f0a36f0350:T=1732029872:RT=1732029872:S=AA-Afjb-6aLxlyvYDpfc45TvOV6Y; FCNEC=%5B%5B%22AKsRol9N0RaQgoTTKDxcBQL0bucmyDGfvPQjAn_YZmIe_WUYCNSVzc8thWRYhygGRcSFhCxHWlsFKebx6BnS00IykGyLabgZYaDZt2_ZeoBHRrM8wUWqE2EXXtguek598fUA4AjPCVOEZQFvlJ4QYDYPg7WpPIDzww%3D%3D%22%5D%5D',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      data: data
    };

    // Send the request
    const response = await axios.request(config);
    const result = response.data;

    if (!result || !result.html) {
      console.log("No Instagram download links found");
      return res
        .status(404)
        .json({ status: false, message: "Gagal menemukan tautan unduhan Instagram" });
    }

    // Extract HTML content from the response
    const htmlContent = result.html;

    // Regular expression to find all img src URLs
    const imgSrcRegex = /<img[^>]+src="([^"]+)"/g;
    const matches = [...htmlContent.matchAll(imgSrcRegex)];

    if (matches.length === 0) {
      console.log("No image URLs found.");
      return res.status(404).json({
        status: false,
        message: "Gagal menemukan tautan gambar",
      });
    }

    // Extract all image URLs from the matches
    const imageUrls = matches.map(match => match[1]);

    console.log("Extracted Instagram Image URLs:", imageUrls);

    return res.status(200).json({
      status: true,
      message: "Tautan unduhan Instagram ditemukan",
      data: {
        imageUrls: imageUrls,
      },
    });
  } catch (error) {
    console.error("Error downloading Instagram Photos:", error);
    return res.status(500).json({
      status: false,
      message: "Gagal mengunduh Instagram Photos",
      error: error.message,
    });
  }
};