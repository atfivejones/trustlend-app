(function(){
  var AUTH_KEY = 'userToken';
  function isAuthed(){ try { return !!localStorage.getItem(AUTH_KEY); } catch(e){ return false; } }

  function navHTML(){
    if(isAuthed()){
      return ['<header class="border-b bg-white">',
        '<div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">',
        '<a href="dashboard.html" class="font-bold text-blue-600">TrustLend</a>',
        '<nav class="space-x-5 text-sm">',
        '<a href="dashboard.html">Dashboard</a>',
        '<a href="create-note.html" data-auth-required>Create Note</a>',
        '<a href="contracts.html">My Contracts</a>',
        '<a href="profile.html">Profile</a>',
        '<button id="signOutBtn">Sign Out</button>',
        '</nav></div></header>'].join('');
    }
    return ['<header class="border-b bg-white">',
      '<div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">',
      '<a href="index.html" class="font-bold text-blue-600">TrustLend</a>',
      '<nav class="space-x-5 text-sm">',
      '<a href="index.html#features">Features</a>',
      '<a href="index.html#pricing">Pricing</a>',
      '<a href="create-note.html" data-auth-required>Create Note</a>',
      '<a href="signin.html" class="text-blue-600">Sign In</a>',
      '</nav></div></header>'].join('');
  }

  function mountNav(){
    var root = document.getElementById('siteNav');
    if(!root) return;
    root.innerHTML = navHTML();
    Array.prototype.forEach.call(root.querySelectorAll('[data-auth-required]'), function(a){
      a.addEventListener('click', function(e){
        if(!isAuthed()){
          e.preventDefault();
          var to = a.getAttribute('href') || 'create-note.html';
          var msg = encodeURIComponent('Please sign in to continue.');
          var redirect = encodeURIComponent(to);
          location.href = 'signin.html?redirect=' + redirect + '&msg=' + msg;
        }
      });
    });
    var signOut = root.querySelector('#signOutBtn');
    if(signOut){
      signOut.addEventListener('click', function(){
        try{ localStorage.removeItem(AUTH_KEY); localStorage.removeItem('userProfile'); }catch(e){}
        location.href = 'index.html';
      });
    }
  }

  function hardGateProtected(){
    var protectedPages = ['create-note.html','dashboard.html','contracts.html','profile.html'];
    var path = (location.pathname || '').toLowerCase();
    var page = path.split('/').pop();
    var onProtected = protectedPages.indexOf(page) >= 0;
    if(onProtected && !isAuthed()){
      var msg = encodeURIComponent('Please sign in to continue.');
      var redirect = encodeURIComponent(page);
      location.replace('signin.html?redirect=' + redirect + '&msg=' + msg);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    hardGateProtected();
    mountNav();
  });
})();
