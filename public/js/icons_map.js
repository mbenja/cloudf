/**
 * maps MIME types to file icons found in the public/images/icons folder
 * @type {Object}
 */
const icons_map = {
  "directory": "folder.png", // http://yousense.info/33/06889-folder-icon-32x32.html
  "parent": "folder.png",
  "audio/x-aac": "aac.png", // https://github.com/redbooth/free-file-icons
  "application/postscript": "ai.png",
  "audio/x-aiff": "aiff.png",
  "video/x-msvideo": "avi.png",
  "image/bmp": "bmp.png",
  "text/x-c": "c.png",
  "text/css": "css.png",
  "text/csv": "csv.png",
  "application/x-apple-diskimage": "dmg.png",
  "application/msword": "doc.png",
  "application/vnd.ms-word.document.macroenabled.12": "doc.png", // actually .docm
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "doc.png", // actually .docx
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": "dotx.png",
  "application/vnd.ms-word.template.macroenabled.12": "dotx.png", //actually .dotm
  "image/vnd.dwg": "dwg.png",
  "image/vnd.dxf": "dxf.png",
  "application/x-msdownload": "exe.png",
  "video/x-flv": "flv.png",
  "image/gif": "gif.png",
  "text/html": "html.png",
  "text/calendar": "ics.png",
  "text/x-java-source,java": "java.png",
  "image/jpeg": "jpg.png",
  "image/x-citrix-jpeg": "jpg.png",
  "application/javascript": "js.png",
  "audio/midi": "mid.png",
  "application/mp4": "mp4.png",
  "video/mp4": "mp4.png",
  "audio/mp4": "mp4.png", // actually .mp4a
  "audio/mpeg": "mpg.png",
  "application/vnd.oasis.opendocument.formula": "odf.png",
  "application/vnd.oasis.opendocument.formula-template": "odf.png", // actually .odft
  "application/vnd.oasis.opendocument.spreadsheet": "ods.png",
  "application/vnd.oasis.opendocument.text": "odt.png",
  "application/vnd.oasis.opendocument.presentation-template": "otp.png",
  "application/vnd.oasis.opendocument.spreadsheet-template": "ots.png",
  "application/vnd.oasis.opendocument.text-template": "ott.png",
  "application/pdf": "pdf.png",
  "image/png": "png.png",
  "image/x-png": "png.png",
  "image/x-citrix-png": "png.png",
  "application/vnd.ms-powerpoint": "ppt.png",
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": "ppt.png", // actually .pptm
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "ppt.png", // actually .pptx
  "image/vnd.adobe.photoshop": "psd.png",
  "video/quicktime": "qt.png",
  "application/x-rar-compressed": "rar.png",
  "application/rtf": "rtf.png",
  "image/tiff": "tiff.png",
  "text/plain": "txt.png",
  "audio/x-wav": "wav.png",
  "application/vnd.ms-excel": "xls.png",
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": "xls.png", // actually .xlsb
  "application/vnd.ms-excel.sheet.macroenabled.12": "xls.png", // actually .xlsm
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xslx.png",
  "application/xml": "xml.png",
  "text/yaml": "yml.png",
  "application/zip": "zip.png"
};

// https://www.freeformatter.com/mime-types-list.html
// cpp, dat, eps, h, hpp, iso, key, less, mp3, php, py, rb, sass, scss, sql, tga, tgz,
