
const   socket = io.connect('http://localhost:3000', {transports: ['websocket']});

let interestsList = [];
let users = [];
let usersFirst = []


$(document).on("click.bs.dropdown.data-api",
                "#notifications", (e) =>{ e.stopPropagation() });

const  addMessage = (text, sender = true) => {
    const template = document.querySelector('.message');
    const wrapper = template.cloneNode(true);

    wrapper.children[0].innerText = text;
    wrapper.classList.add(sender ? 'sent' : 'recieved')
    wrapper.style.display = "block";
    document.querySelector("#messages").appendChild(wrapper);
    scrollToEnd();
}


const sendMessage = (room) => {
    const input = document.querySelector("#new-message input");
    const message = input.value;

    if (message.trim().length > 0) {
        chatSocket.emit('send message', {room, message});
        socket.emit('new message notification', room);
        addMessage(message)
    }
    input.value = '';
}

const   getGeolocation = () => {
    const locationInput = document.getElementById('location');
    let geoData = {};

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            geoData.lat = position.coords.latitude;
            geoData.lon = position.coords.longitude;

            locationInput.value = JSON.stringify(geoData);
        });
    }
};

const   getInterestsList = () => {
    fetch('/profile/interests/getlist', {method: 'GET'})
        .then(res => {
            return res.json();
        })
        .then(result => {
            interestsList = JSON.parse(result);
        })
        .catch(err => {
            return ;
        });
};

const   autoComplete = (input) => {
    return interestsList.filter(
            x => x.toLowerCase().includes(input.toLowerCase())
            );
 }

const   selectInterest = (text) => {
    const dropdownMenu = document.getElementById('interest-suggestions');
    const input = document.getElementById('dropdownInput');

    input.value = text;
    dropdownMenu.style.display = 'none';
    dropdownMenu.innerHTML = '';
}

const   autoSuggest = (input) => {
    const dropdownMenu = document.getElementById('interest-suggestions');

    if (input === '') {
        dropdownMenu.innerHTML = '';
        dropdownMenu.style.display = 'none';
        return ;
    }
   
    const list = autoComplete(input);

    let res = '';
    list.map(interest => {
        res += '<li class="dropdownItem" onclick="selectInterest(this.innerText)">' + interest + '</li>';
    });

    if (res !== '') {
        dropdownMenu.innerHTML = res;
        dropdownMenu.style.display = 'block';
    }
    
}


const   addLike = (id) => {
    fetch('/likes/add/' + id, {method: 'GET'})
        .then(res => {
            return res.json();
        })
        .then(res => {
            if (! res.success)
                displayAlert(res.success, res.msg);
            else {
                let url = null;
                changeLikesNumber();
                toggleLikeButton();
                if(res.isMatch) {
                    url = '/chat/private/' + res.chat;
                    displayAlert(res.success, "It's a match!");
                    toggleChatButton(true, url);
                }
                socket.emit('add new notification', {
                    to: id,
                    type: res.isMatch ? "match" : "like",
                    isMatch: res.isMatch,
                    url: url, id: res.id
                });
            }
        })
        .catch(err => {
            displayAlert("error", err);
        });
}


const   removeLike = (id) => {
    fetch('/likes/delete/' + id, {method: 'GET'})
        .then(res => {
            return res.json();
        })
        .then(res => {
            if (res.success) {
                changeLikesNumber(false);
                toggleChatButton(false);
                toggleLikeButton(false);
                if (res.wasConnected) {
                    socket.emit('add new notification', {
                        to: id, type: "dislike",
                        isMatch: false,  url: null, 
                        id: res.id
                    });
                }
            }
        })
        .catch(err => {
            return ;
        });
}

const   treatNotification = (notification, online = true) => {
    const text = setText(notification.type);

    const message = "<div class='dropdown-item text-center mt-1 px-2 py-1'>" + "<a class='text-decoration-none' href='/profile/view/" + notification.from 
                    + "'>" + notification.from + "</a>" + "<span id='" + notification.id + "' onclick='removeNotification(this)' class='text-wrap'> "
                    + text + "</span>" + "</div>";

    showNotification(message);
    if (online 
        && (notification.type === "like"
            || notification.type === "dislike"
            || notification.type === "match")){
                toggleChatButton(notification.isMatch, notification.url);
            }
}

const   removeNotification = (notification) => {
    const { id } = notification;

    fetch('/notification/delete/'+ id, { method: 'GET'})
        .then(res => {
            return res.json();
        })
        .then(res => {
            if (res.succes)
                hideNotification(notification.parentElement);
        })
        .catch(err => {
            return ;
        });
}


const getAllNotifications = () => {
    fetch('/notification/all', { method: 'GET'})
        .then(response => {
            return response.json();
        })
        .then(res => {
            if (res.success) {
                res.notifications.forEach(o => {
                    treatNotification(o, false);
                });
            }    
        })
        .catch(err => {
            return ;
        });
}


const sortUsersByNumber = (btn, type) => {
    const btnContainer = btn.parentElement;
    const container = document.getElementById('users-container');

    const asc = btnContainer.classList.contains('dropup');

    if (type === "age")
        users.sort((a, b) => {return Number(a.age) - Number(b.age);});
    else if (type === "rat")
        users.sort((a, b) => { return  Number(a.rating) - Number(b.rating);});
    else
        users.sort((a, b) => { return  Number(a.distance) - Number(b.distance);});

    toggleSortFilterBtn(btnContainer, asc);

    container.innerHTML = '';
    users = asc ? users : users.reverse();
    showUsers(1);
    showPagination(users.length);
}


const sortUsersByInterests = (btn, interests) => {
    const btnContainer = btn.parentElement;
    const container = document.getElementById('users-container');

    const asc = btnContainer.classList.contains('dropup');

    users.sort((a, b) => {
        let aMatch = 0,
            bMatch = 0;

            a.tags.forEach(tag => {
                aMatch += interests.filter(t => t.text.toString() === tag.text.toString()).length;
            });
            b.tags.forEach(tag => {
                bMatch += interests.filter(t => t.text.toString() === tag.text.toString()).length;
            });

            return aMatch - bMatch;
    });

    toggleSortFilterBtn(btnContainer, asc);

    container.innerHTML = '';
    users = asc ? users : users.reverse();
    showUsers(1);
    showPagination(users.length);
}


const fetchUsersDefault = () => {
    fetch('/feed/browse/fetch', {method: "GET"})
        .then(res => {
            return res.json();
        })
        .then(data => {
            usersFirst = users = data;
            showUsers(1);
            showPagination(users.length);
            fillFilter();
        })
        .catch(err => {
            return ;
        });
}


const fetchUsersByInterest = (e, form) => {
    e.preventDefault();

    const interest = form['interest'].value;
    $('#search').modal('hide')

    fetch('/feed/search/interest/' + interest, {method: "GET"})
    .then(res => {
        return res.json();
    })
    .then(data => {
        usersFirst = users = data;
        showUsers(1);
        showPagination(users.length);
        fillFilter();
    })
    .catch(err => {
        return ;
    });
}

const fetchUsersCustom = (e, form) => {
    e.preventDefault();

    const body = {
        agemin: form['minage'].value,
        agemax: form['maxage'].value,
        distancemin: form['mindistance'].value,
        distancemax: form['maxdistance'].value,
        famemin: form['minrate'].value,
        famemax: form['maxrate'].value,
    }

    $('#search').modal('hide');

    fetch('/feed/search/custom', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    })
    .then(res => {
        return res.json();
    })
    .then(data => {
        usersFirst = users = data;
        showUsers(1);
        showPagination(users.length);
        fillFilter();
    })
    .catch(err => {
        return ;
    });
}

const fillFilter = () => {
    const filtered = interests.map(o => { return o.text});

    let minAge = users[0] && users[0].age ? Number(users[0].age) : users.length ? 16 : 0;
    let maxAge = minAge;

    let minDistance = users[0] ? Number(users[0].distance) : 0;
    let maxDistance = minDistance;

    let minFame = users[0] ? Number(users[0].rating) : 0;
    let maxFame = minFame;

    let minTags = users[0] && users[0].tags ? users[0].tags.filter(o => filtered.includes(o.text)).length : 0;
    let maxTags = minTags;

    users.forEach(user => {
        const distance = Number(user.distance);
        const rating = Number(user.rating);

        const commonTags = user.tags ? user.tags.filter(o => filtered.includes(o.text)).length : 0;

        if (distance > maxDistance) maxDistance = distance;
        if (distance < minDistance) minDistance = distance;

        if (rating > maxFame) maxFame = rating;
        if (rating < minFame) minFame = rating;

        if (commonTags > maxTags) maxTags = commonTags;
        if (commonTags < minTags) minTags = commonTags;

        if (user.age) {
            const age = Number(user.age);

            if (age && age > maxAge) maxAge = age;
            if (age && age < minAge) minAge = age;
        }
    });

    document.querySelector('#agemin').value = minAge;
    document.querySelector('#agemax').value = maxAge;

    document.querySelector('#distancemin').value = minDistance;
    document.querySelector('#distancemax').value = maxDistance;

    document.querySelector('#famemin').value = minFame;
    document.querySelector('#famemax').value = maxFame;

    document.querySelector('#tagmin').value = minTags;
    document.querySelector('#tagmax').value = maxTags;
}

const handleFilter = (e, form) => {
    e.preventDefault();

    const filtered = interests.map(o => { return o.text});

    const minAge = form['agemin'].value;
    const maxAge = form['agemax'].value;
    
    const minDistance = form['distancemin'].value;
    const maxDistance = form['distancemax'].value;

    const minFame = form['famemin'].value;
    const maxFame = form['famemax'].value;

    const minTags = form['tagmin'].value;
    const maxTags = form['tagmax'].value;

    users = users.filter(user => {
        const commonTags = user.tags ? user.tags.filter(o => filtered.includes(o.text)).length : 0;

        return user.age && user.age >= minAge && user.age <= maxAge
        && user.distance >= minDistance && user.distance <= maxDistance
        && user.rating >= minFame && user.rating <= maxFame
        && commonTags >= minTags && commonTags <= maxTags;
    });

    
    fillFilter();
    showPagination(users.length);
    showUsers(1);
}

const resetFilter = (e) => {
    e.preventDefault();

    users = usersFirst;

    fillFilter();
    showPagination(users.length);
    showUsers(1);
}