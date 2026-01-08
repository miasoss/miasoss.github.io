// ========== 学习内容库 ==========
const Content = {
    // 英语句子库
    learnSentences: [
        {
            en: "The celebrated theory is still the source of great controversy.",
            cn: "这个著名的理论仍然是巨大争议的根源。"
        },
        {
            en: "A group meeting will be held tomorrow in the library conference room.",
            cn: "明天将在图书馆会议室举行小组会议。"
        },
        {
            en: "The company's rapid expansion has led to some growing pains.",
            cn: "公司的快速扩张带来了一些成长中的阵痛。"
        },
        {
            en: "She proposed an innovative approach to solving the problem.",
            cn: "她提出了一个创新性的解决问题的方法。"
        },
        {
            en: "The research findings were published in a prestigious journal.",
            cn: "研究结果发表在一本著名的期刊上。"
        },
        {
            en: "He demonstrated remarkable resilience in the face of adversity.",
            cn: "面对逆境，他展现了非凡的韧性。"
        },
        {
            en: "The committee will review all applications by the end of the month.",
            cn: "委员会将在月底前审查所有申请。"
        },
        {
            en: "Environmental protection should be a priority for every government.",
            cn: "环境保护应该是每个政府的优先事项。"
        },
        {
            en: "The new policy aims to promote sustainable development.",
            cn: "新政策旨在促进可持续发展。"
        },
        {
            en: "Her presentation was both informative and engaging.",
            cn: "她的演讲既有信息量又有吸引力。"
        },
        {
            en: "The project requires a significant amount of funding and resources.",
            cn: "这个项目需要大量的资金和资源。"
        },
        {
            en: "His dedication to his work is truly admirable.",
            cn: "他对工作的投入确实令人钦佩。"
        },
        {
            en: "The conference attracted experts from all over the world.",
            cn: "这次会议吸引了来自世界各地的专家。"
        },
        {
            en: "We need to develop a comprehensive strategy for market penetration.",
            cn: "我们需要制定一个全面的市场渗透策略。"
        },
        {
            en: "The software update includes several new features and bug fixes.",
            cn: "软件更新包括几个新功能和错误修复。"
        }
    ],

    // 单词词典
    wordDictionary: {
        "celebrated": {
            pronunciation: "/ˈselɪbreɪtɪd/",
            meaning: "adj. 著名的；有名望的；受赞誉的",
            example: "例句：She is a celebrated pianist. (她是一位著名的钢琴家。)"
        },
        "theory": {
            pronunciation: "/ˈθɪəri/",
            meaning: "n. 理论；学说；原理",
            example: "例句：Einstein's theory of relativity changed physics. (爱因斯坦的相对论改变了物理学。)"
        },
        "controversy": {
            pronunciation: "/ˈkɒntrəvɜːsi/",
            meaning: "n. 争议；争论；辩论",
            example: "例句：The new law caused much controversy. (新法律引起了很多争议。)"
        },
        "expansion": {
            pronunciation: "/ɪkˈspænʃn/",
            meaning: "n. 扩张；扩大；扩展",
            example: "例句：The company's expansion into new markets was successful. (公司向新市场的扩张很成功。)"
        },
        "innovative": {
            pronunciation: "/ˈɪnəveɪtɪv/",
            meaning: "adj. 创新的；革新的",
            example: "例句：They developed an innovative solution to the problem. (他们提出了一个创新的解决方案。)"
        },
        "prestigious": {
            pronunciation: "/preˈstɪdʒəs/",
            meaning: "adj. 有威望的；有声望的；受尊敬的",
            example: "例句：He graduated from a prestigious university. (他毕业于一所名牌大学。)"
        },
        "resilience": {
            pronunciation: "/rɪˈzɪliəns/",
            meaning: "n. 韧性；恢复力；适应力",
            example: "例句：Children often show remarkable resilience. (孩子们通常表现出非凡的韧性。)"
        },
        "sustainable": {
            pronunciation: "/səˈsteɪnəbl/",
            meaning: "adj. 可持续的；能维持的",
            example: "例句：We need to find sustainable energy sources. (我们需要找到可持续的能源。)"
        },
        "informative": {
            pronunciation: "/ɪnˈfɔːmətɪv/",
            meaning: "adj. 提供信息的；增长见闻的",
            example: "例句：The documentary was very informative. (这部纪录片信息量很大。)"
        },
        "engaging": {
            pronunciation: "/ɪnˈɡeɪdʒɪŋ/",
            meaning: "adj. 迷人的；有吸引力的；有趣的",
            example: "例句：He is an engaging speaker. (他是一位有吸引力的演讲者。)"
        },
        "dedication": {
            pronunciation: "/ˌdedɪˈkeɪʃn/",
            meaning: "n. 奉献；投入；献身",
            example: "例句：Her dedication to teaching is inspiring. (她对教学的投入令人鼓舞。)"
        },
        "comprehensive": {
            pronunciation: "/ˌkɒmprɪˈhensɪv/",
            meaning: "adj. 全面的；综合的；广泛的",
            example: "例句：We need a comprehensive review of the system. (我们需要对系统进行全面审查。)"
        },
        "strategy": {
            pronunciation: "/ˈstrætədʒi/",
            meaning: "n. 策略；战略；计谋",
            example: "例句：The company developed a new marketing strategy. (公司制定了新的营销策略。)"
        }
    },

    // 获取随机句子
    getRandomSentence() {
        const randomIndex = Math.floor(Math.random() * this.learnSentences.length);
        return this.learnSentences[randomIndex];
    },

    // 获取单词信息
    getWordInfo(word) {
        const pureWord = word.toLowerCase();
        return this.wordDictionary[pureWord] || null;
    },

    // 处理句子中的单词（添加点击功能）
    processSentence(sentence) {
        const words = sentence.split(' ');
        let html = '';
        
        words.forEach(word => {
            const pureWord = word.replace(/[.,;:!?]/g, '').toLowerCase();
            if (this.wordDictionary[pureWord]) {
                html += `<span class="word-span" onclick="learning.showWordModal('${pureWord}')">${word}</span> `;
            } else {
                html += `${word} `;
            }
        });
        
        return html.trim();
    }
};