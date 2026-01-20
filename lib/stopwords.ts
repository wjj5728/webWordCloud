// 英文停用词列表
export const englishStopwords = [
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
  'had', 'what', 'said', 'each', 'which', 'their', 'time', 'if',
  'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
  'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more',
  'very', 'after', 'words', 'long', 'than', 'first', 'been', 'call',
  'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get',
  'come', 'made', 'may', 'part', 'job', 'jobs', 'work', 'remote',
  'web3', 'blockchain', 'crypto', 'apply', 'apply now', 'click',
  'here', 'www', 'http', 'https', 'com', 'org', 'io', 'email',
  'phone', 'contact', 'about', 'home', 'menu', 'nav', 'header',
  'footer', 'copyright', 'privacy', 'terms', 'cookie', 'policy'
];

// 中文停用词列表
export const chineseStopwords = [
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人',
  '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去',
  '你', '会', '着', '没有', '看', '好', '自己', '这', '年', '工作',
  '职位', '招聘', '应聘', '简历', '薪资', '公司', '团队', '我们',
  '网站', '页面', '链接', '更多', '了解', '详情'
];

export const allStopwords = [...englishStopwords, ...chineseStopwords];
