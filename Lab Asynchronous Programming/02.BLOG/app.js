
function attachEvents() {
    const baseUrl = 'https://blog-apps-c12bf.firebaseio.com';

    let loadPostsElement = document.getElementById('btnLoadPosts');
    let postsElement = document.getElementById('posts');

    loadPostsElement.addEventListener('click', () => {
        fetch(`${baseUrl}/posts/.json`)
            .then(res => res.json())
            .then (data => {
                let options = Object.keys(data).map(key => `<option value="${key}">${data[key].title}</option>`).join('');
                postsElement.innerHTML = options;

            })
    })
    postsElement.addEventListener('change', e => {
        console.log(e.currentTarget.value);
        fetch(``)
    })
}

attachEvents();