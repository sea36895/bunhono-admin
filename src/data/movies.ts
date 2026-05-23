import type { Movie } from './types';

export const movies: Movie[] = [
  {
    id: '1',
    title: '星际穿越',
    year: 2014,
    genre: ['科幻', '冒险', '剧情'],
    rating: 9.4,
    duration: 169,
    description: '在不久的未来，地球已经变得不再适合居住，人类面临着灭绝的威胁。一群勇敢的探险家利用新发现的虫洞，超越人类太空旅行的极限，在广袤的宇宙中展开星际航行，寻找人类新的家园。',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=interstellar%20movie%20poster%20epic%20space%20adventure&image_size=portrait_4_3',
    director: '克里斯托弗·诺兰',
    cast: ['马修·麦康纳', '安妮·海瑟薇', '杰西卡·查斯坦']
  },
  {
    id: '2',
    title: '盗梦空间',
    year: 2010,
    genre: ['科幻', '动作', '惊悚'],
    rating: 9.3,
    duration: 148,
    description: '道姆·柯布是一位经验丰富的窃贼，他专门从别人的潜意识中盗取有价值的秘密。现在，他有机会获得救赎——他被给予了一项几乎不可能完成的任务：在目标的潜意识中植入一个想法。',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=inception%20movie%20poster%20dream%20heist&image_size=portrait_4_3',
    director: '克里斯托弗·诺兰',
    cast: ['莱昂纳多·迪卡普里奥', '约瑟夫·高登-莱维特', '艾伦·佩吉']
  },
  {
    id: '3',
    title: '肖申克的救赎',
    year: 1994,
    genre: ['剧情', '犯罪'],
    rating: 9.7,
    duration: 142,
    description: '银行家安迪被冤枉谋杀妻子和她的情人，被判处无期徒刑，进入肖申克监狱服刑。在监狱中，他遇到了瑞德，一个黑人囚犯，开始了一段跨越二十年的友谊。安迪用自己的智慧和坚韧，为自己和狱友们带来了希望。',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shawshank%20redemption%20movie%20poster%20classic&image_size=portrait_4_3',
    director: '弗兰克·德拉邦特',
    cast: ['蒂姆·罗宾斯', '摩根·弗里曼']
  },
  {
    id: '4',
    title: '阿甘正传',
    year: 1994,
    genre: ['剧情', '爱情'],
    rating: 9.5,
    duration: 142,
    description: '一个智商只有75的低能儿阿甘，在母亲的教育下，自强不息，最终“傻人有傻福”地得到上天眷顾，在多个领域创造奇迹的励志故事。',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forrest%20gump%20movie%20poster%20inspirational&image_size=portrait_4_3',
    director: '罗伯特·泽米吉斯',
    cast: ['汤姆·汉克斯', '罗宾·怀特']
  },
  {
    id: '5',
    title: '黑客帝国',
    year: 1999,
    genre: ['科幻', '动作'],
    rating: 9.0,
    duration: 136,
    description: '一名年轻的网络黑客尼奥发现看似正常的现实世界实际上是由一个名为“矩阵”的计算机人工智能系统控制的。尼奥在一名神秘女郎崔妮蒂的引导下见到了黑客组织的首领墨菲斯，三人走上了抗争矩阵的征途。',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=matrix%20movie%20poster%20cyberpunk%20neo&image_size=portrait_4_3',
    director: '沃卓斯基姐妹',
    cast: ['基努·里维斯', '劳伦斯·菲什伯恩', '凯瑞-安·莫斯']
  },
  {
    id: '6',
    title: '泰坦尼克号',
    year: 1997,
    genre: ['爱情', '剧情', '灾难'],
    rating: 9.4,
    duration: 194,
    description: '1912年，豪华客轮泰坦尼克号开始了她的处女航，从英国驶向美国纽约。贵族少女露丝与穷画家杰克不顾门第悬殊，坠入爱河。然而，一场巨大的灾难正在等待着他们……',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=titanic%20movie%20poster%20romantic%20tragedy&image_size=portrait_4_3',
    director: '詹姆斯·卡梅隆',
    cast: ['莱昂纳多·迪卡普里奥', '凯特·温斯莱特']
  },
  {
    id: '7',
    title: '千与千寻',
    year: 2001,
    genre: ['动画', '奇幻', '冒险'],
    rating: 9.4,
    duration: 125,
    description: '10岁的少女千寻与父母一起从城里搬到乡下，途中误入一个神灵的世界。父母因贪吃变成了猪，千寻为了救回父母，在汤婆婆的澡堂里工作，开始了一段奇幻的冒险之旅。',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spirited%20away%20movie%20poster%20studio%20ghibli%20anime&image_size=portrait_4_3',
    director: '宫崎骏',
    cast: ['柊瑠美', '入野自由', '夏木真理']
  },
  {
    id: '8',
    title: '复仇者联盟4：终局之战',
    year: 2019,
    genre: ['动作', '科幻', '冒险'],
    rating: 8.5,
    duration: 181,
    description: '一声响指，宇宙一半生命化为灰烬。在灭霸消灭宇宙一半的生命并重创复仇者联盟之后，剩余的英雄被迫背水一战，为22部漫威电影写下传奇终章。',
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=avengers%20endgame%20movie%20poster%20marvel%20superheroes&image_size=portrait_4_3',
    director: '安东尼·罗素、乔·罗素',
    cast: ['小罗伯特·唐尼', '克里斯·埃文斯', '马克·鲁法洛']
  }
];
