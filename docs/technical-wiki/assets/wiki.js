(function () {
  const nav = [{"group":"Start here","items":[["index.html","Overview"],["repository-map.html","Repository map"],["architecture.html","Architecture"]]},{"group":"Applications","items":[["frontend.html","Frontend"],["backend.html","Backend"],["shared-sdk.html","Shared packages and SDK"],["services.html","Services and jobs"]]},{"group":"Product domains","items":[["forms-submissions.html","Forms and submissions"],["auth-access.html","Auth and access"],["payments.html","Payments"],["integrations.html","Integrations"],["data-flows.html","Data flows"]]},{"group":"Build and operate","items":[["local-development.html","Local development"],["testing.html","Testing"],["ci-cd-deployment.html","CI/CD and deployment"],["configuration.html","Configuration"],["operations-migrations.html","Operations and migrations"]]},{"group":"Reference","items":[["extension-guides.html","Extension guides"],["key-file-index.html","Key file index"],["glossary-gotchas.html","Glossary and gotchas"]]}]
  const active = document.body.dataset.page || 'index.html'
  const sidebar = document.getElementById('wiki-sidebar')

  function renderNav(filter) {
    const term = (filter || '').trim().toLowerCase()
    const groups = nav.map((group) => {
      const items = group.items.filter((item) => !term || item[1].toLowerCase().includes(term) || item[0].toLowerCase().includes(term))
      if (!items.length) return ''
      const links = items.map((item) => '<li><a class="' + (item[0] === active ? 'active' : '') + '" href="' + item[0] + '">' + item[1] + '</a></li>').join('')
      return '<div class="nav-group"><h2>' + group.group + '</h2><ul>' + links + '</ul></div>'
    }).join('')
    sidebar.innerHTML = '<div class="brand-block"><span class="logo-mark">FS</span><div><strong>FormSG Wiki</strong><span>Technical documentation</span></div></div><input class="nav-search" type="search" placeholder="Filter pages" aria-label="Filter wiki pages" />' + groups
    const input = sidebar.querySelector('.nav-search')
    input.value = filter || ''
    input.addEventListener('input', function (event) { renderNav(event.target.value) })
  }

  function renderToc() {
    const headings = Array.from(document.querySelectorAll('main h2'))
    if (headings.length < 2) return
    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }
    })
    const toc = document.createElement('nav')
    toc.className = 'toc'
    toc.setAttribute('aria-label', 'On this page')
    toc.innerHTML = '<strong>On this page</strong>' + headings.map((heading) => '<a href="#' + heading.id + '">' + heading.textContent + '</a>').join('')
    const firstCard = document.querySelector('.section-card')
    if (firstCard) firstCard.parentNode.insertBefore(toc, firstCard)
  }

  function bindMobileNav() {
    const button = document.querySelector('[data-nav-toggle]')
    if (!button) return
    button.addEventListener('click', function () {
      document.body.classList.toggle('nav-open')
    })
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') document.body.classList.remove('nav-open')
    })
  }

  if (sidebar) renderNav('')
  renderToc()
  bindMobileNav()
})()
