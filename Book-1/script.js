/* script.js */
const $ = s=>document.querySelector(s);
const booksKey='bookverse_books_v1';
const prefsKey='bookverse_prefs_v1';
const tbody=$('#booksTable tbody');
const spinner=$('#spinner');
const emptyMsg=$('#emptyMsg');
const form=$('#bookForm');
const idInput=$('#bookId');
const titleInput=$('#title');
const authorInput=$('#author');
const genreInput=$('#genre');
const ratingInput=$('#rating');
const searchInput=$('#search');
const genreFilter=$('#genreFilter');
const sortRating=$('#sortRating');
const clearBtn=$('#clearBtn');
const cancelEdit=$('#cancelEdit');

function uid(){return 'id_'+Math.random().toString(36).slice(2,9)}
function saveBooks(b){localStorage.setItem(booksKey,JSON.stringify(b))}
function loadBooks(){return JSON.parse(localStorage.getItem(booksKey)||'[]')}
function savePrefs(p){localStorage.setItem(prefsKey,JSON.stringify(p))}
function loadPrefs(){return JSON.parse(localStorage.getItem(prefsKey)||'{}')}
function showSpinner(x){spinner.classList.toggle('show',!!x)}

function populateGenreFilter(){
  const books=loadBooks();
  const set=new Set(books.map(b=>b.genre));
  const defaults=['Fiction','Non-Fiction','Poetry','Sci-Fi','Fantasy','Other'];
  genreFilter.innerHTML='<option value="all">All genres</option>'+Array.from(new Set([...defaults,...set])).map(g=>`<option value="${g}">${g}</option>`).join('');
}

function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
function renderBooks(){
  const books=loadBooks();
  let list=books.slice();
  const q=(searchInput.value||'').trim().toLowerCase();
  if(q)list=list.filter(b=>(b.title+b.author).toLowerCase().includes(q));
  const gf=genreFilter.value;
  if(gf!=='all')list=list.filter(b=>b.genre===gf);
  const sort=sortRating.value;
  if(sort==='asc')list.sort((a,b)=>a.rating-b.rating);
  if(sort==='desc')list.sort((a,b)=>b.rating-a.rating);
  tbody.innerHTML='';
  if(!list.length)emptyMsg.style.display='block';else emptyMsg.style.display='none';
  for(const b of list){
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${escapeHtml(b.title)}</td><td>${escapeHtml(b.author)}</td><td>${escapeHtml(b.genre)}</td><td>${b.rating}</td><td><button data-id="${b.id}" data-action="edit">Edit</button><button data-id="${b.id}" data-action="delete">Delete</button></td>`;
    tbody.appendChild(tr);
  }
}

async function init(){
  showSpinner(true);
  await new Promise(r=>setTimeout(r,500));
  populateGenreFilter();
  renderBooks();
  showSpinner(false);
}

form.addEventListener('submit',e=>{
  e.preventDefault();
  const books=loadBooks();
  const id=idInput.value||uid();
  const data={id,title:titleInput.value.trim(),author:authorInput.value.trim(),genre:genreInput.value,rating:Number(ratingInput.value)};
  const i=books.findIndex(b=>b.id===id);
  if(i>=0)books[i]=data;else books.push(data);
  saveBooks(books);populateGenreFilter();renderBooks();form.reset();idInput.value='';ratingInput.value=3;
});

tbody.addEventListener('click',e=>{
  const btn=e.target.closest('button');if(!btn)return;
  const id=btn.dataset.id;const act=btn.dataset.action;
  if(act==='delete'){if(confirm('Delete this book?')){let b=loadBooks();b=b.filter(x=>x.id!==id);saveBooks(b);populateGenreFilter();renderBooks();}}
  if(act==='edit'){const b=loadBooks().find(x=>x.id===id);if(!b)return;idInput.value=b.id;titleInput.value=b.title;authorInput.value=b.author;genreInput.value=b.genre;ratingInput.value=b.rating;window.scrollTo({top:0,behavior:'smooth'});}
});

clearBtn.addEventListener('click',()=>{if(confirm('Clear all books?')){localStorage.removeItem(booksKey);populateGenreFilter();renderBooks();}});
cancelEdit.addEventListener('click',()=>{form.reset();idInput.value='';ratingInput.value=3});

function debounce(fn,ms=300){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
searchInput.addEventListener('input',debounce(renderBooks,400));
genreFilter.addEventListener('change',renderBooks);
sortRating.addEventListener('change',renderBooks);

init();
