document.getElementById("logar").addEventListener("click",(async function(e){e.preventDefault();const t={campo_nome_usuario:document.getElementById("myusername").value,campo_senha:document.getElementById("mypassword").value};try{let e=[],o=document.querySelectorAll("[required]"),s=document.getElementById("msg-error"),i=o.length;s.style.display="inline"===s.style.display?"none":s.style.display;for(var n=0;n<i;n++)o[n].value?(console.log(o[n]+"valid"),o[n].parentElement.classList.remove("auth-invalid-input")):(e.push(o[n]),o[n].parentElement.classList.add("auth-invalid-input"),Swal.fire({toast:!0,icon:"error",position:"top-end",showConfirmButton:!1,timer:1600,title:"Preencha os campos e tente novamente!"}));if(0===e.length){const e=await fetch("/api_admin/users/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),n=await e.json();200==n.status?(sessionStorage.setItem("data",JSON.stringify({nome:n.name,level:n.post,nToken:"HkjEpit34ErLHGfre23IOr/"+n.level})),Swal.fire({toast:!0,icon:"success",showConfirmButton:!1,position:"top-end",timer:1600,title:n.message}),setTimeout((function(){window.location.href="/admin/info"}),1600)):s.style.display="none"===s.style.display?"inline":s.style.display}}catch(e){console.error(e)}}));