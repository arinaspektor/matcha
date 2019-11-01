const perPage = 12;

const btnToggle = () => {
    const btn = document.getElementById('picture-upload-button');

    btn.toggleAttribute('disabled');
}

const toggleSortFilterBtn = (elem, asc) => {
    if (asc) 
        return elem.classList.remove('dropup');
    elem.classList.add('dropup')
}

const   scrollToEnd = () =>{
    const messages = document.getElementById("messages");
	messages.scrollTo(0, 1000000000);
}

const displayAlert = (success, msg) => {
    const alert = document.querySelector('#fetchAlert');
    alert.children[0].innerText = msg;
    alert.classList.add(success ? 'alert-success' : 'alert-danger');
    alert.style.display = 'block';
}

const changeLikesNumber = (add = true) => {
    const likeSpan = document.querySelector('#like-container span');
    const count = Number(likeSpan.innerText) + (add ? 1 : -1);

    likeSpan.innerText = count;
}


const toggleChatButton = (show, url = null) => {
    const btn = document.querySelector('#chat-link');

    if (btn) {
        btn.querySelector('a').href = show ? url : '#';
        btn.style.display = show ? 'block' : 'none';
    }
}

const toggleLikeButton = (show = true) => {
    const likeBtn = document.querySelector('#like');
    const dislikeBtn = document.querySelector('#dislike');

    if (likeBtn && dislikeBtn) {
        likeBtn.style.display = show ? 'none' : 'block';
        dislikeBtn.style.display = show ? 'block' : 'none';
    }
}

const   setText = (type) => {
    switch(type) {
        case "like":
            return 'liked your profile';
        case "visit":
            return 'visited your profile';
        case "match":
            return "liked your profile in return. It's a match!"
        case "dislike":
            return "disliked your profile";
        case "message":
            return "sent you a new message";
    }
}

const   showNotification = (notification) => {
    const dropdown = document.querySelector('#notifications');
    const badge = document.querySelector('#notifications-badge');

    if (! Number(badge.innerText))
        dropdown.children[0].style.display = 'none';

    const oldContent = dropdown.innerHTML.toString();

    dropdown.innerHTML = notification + oldContent;
    badge.innerText = Number(badge.innerText) + 1;
    badge.classList.add('bg-white');
}

const   hideNotification = (dropdownItem) => {
    const dropdown = document.querySelector('#notifications');
    const badge = document.querySelector('#notifications-badge');
    const count = Number(badge.innerText) - 1;
        
    badge.innerText = count;
    dropdownItem.remove();

    if (! count) {
        badge.classList.remove('bg-white');
        dropdown.children[0].style.display = 'block';
    }
    
}

const showPagination = (count) => {
    const pagination = document.querySelector('.pagination');

    pagination.innerHTML = '';
    const pages = count / perPage;

    if (count > perPage) {

        for(let page = 1; page <= pages; page++) {
            const newPage = "<li class='page-item"
                            + (page === 1 ? " active' " : "' ")
                            + "><a class='page-link' href='#' onclick='showUsers("
                            + page + ")'>" + page + "</a></li>";
            pagination.innerHTML += newPage;
        }
    }
}

const toggleActivePage = (page) => {
    document.querySelector(".active").classList.remove('active');
    document.getElementsByClassName("page-item")[page-1].classList.add('active');
   
}

const showUsers = (page) => {
    const container = document.getElementById('users-container');

    container.innerHTML = '';

    if (! users.length)
        container.innerHTML = '<p class="mx-auto mt-5">No matching users :(</p>';
                         
    const offset = (perPage * page) - perPage;
    const data = users.slice(offset, offset + perPage);

    data.map((user) => {
        const block = '<div class="col col-sm-12 col-md-12 col-lg-6 mb-3 img-container text-center">\
                        <div class="row mx-auto py-2 ">\
                            <a href="/profile/view/' + user.username + '" target="_blank"><span class="pl-2 text-monospace">'+user.username+'</span></a>'
                            + (user.age > 0 ? '<span class="text-muted ml-auto pr-2 mt-1" style="font-size: 0.9em">'+ user.age + ' years old</span>' : '')
                             + '</div>' + ' <img src="' + (user.picture || '/images/default.png') + '" alt=""></div>';         
        
        container.innerHTML += block;
    });

    if (page > 1)
        toggleActivePage(page);
}
