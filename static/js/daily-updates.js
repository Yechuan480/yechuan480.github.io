// 日常动态功能实现
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const newPostBtn = document.getElementById('new-post-btn');
    const postForm = document.getElementById('post-form');
    const postsList = document.getElementById('posts-list');
    const submitBtn = document.getElementById('submit-post');
    const cancelBtn = document.getElementById('cancel-post');
    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');

    // 从localStorage加载已保存的帖子
    function loadPosts() {
        const savedPosts = localStorage.getItem('dailyPosts');
        return savedPosts ? JSON.parse(savedPosts) : [];
    }

    // 保存帖子到localStorage
    function savePosts(posts) {
        localStorage.setItem('dailyPosts', JSON.stringify(posts));
    }

    // 渲染帖子列表
    function renderPosts() {
        const posts = loadPosts();
        
        // 清空当前列表
        postsList.innerHTML = '';
        
        // 按日期降序排序帖子
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 渲染每个帖子
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'daily-post';
            
            const formattedDate = new Date(post.date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            postElement.innerHTML = `
                <div class="post-header">
                    <h4 class="post-title">${post.title}</h4>
                    <span class="post-date">${formattedDate}</span>
                </div>
                <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
            `;
            
            postsList.appendChild(postElement);
        });
    }

    // 显示发布表单
    function showPostForm() {
        postForm.classList.add('active');
        titleInput.focus();
    }

    // 隐藏发布表单
    function hidePostForm() {
        postForm.classList.remove('active');
        titleInput.value = '';
        contentInput.value = '';
    }

    // 添加新帖子
    function addNewPost(event) {
        event.preventDefault();
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title || !content) {
            alert('标题和内容不能为空！');
            return;
        }
        
        const newPost = {
            id: Date.now(),
            title: title,
            content: content,
            date: new Date().toISOString()
        };
        
        const posts = loadPosts();
        posts.push(newPost);
        savePosts(posts);
        
        renderPosts();
        hidePostForm();
    }

    // 事件监听
    if (newPostBtn) {
        newPostBtn.addEventListener('click', showPostForm);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            hidePostForm();
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', addNewPost);
    }

    // 初始化加载帖子
    renderPosts();
});