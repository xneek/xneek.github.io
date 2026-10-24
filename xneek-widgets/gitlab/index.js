import { Widget } from "../widget.js";

export class GitlabMrWidget extends Widget {
  constructor() {
    super(import.meta.url, "GitlabMrWidget");
  }

  init() {
    const logoLink = this.shadowRoot.getElementById("logoLink");
    const gitlabBody = this.shadowRoot.getElementById("gitlabBody");
    const gitlabHeader = this.shadowRoot.getElementById("gitlabHeader");

    const pt = this.storage.getValue("pt");
    const domain = this.storage.getValue("domain");
    const auth = () => {
      const dom = prompt('Введите адрес вашего гитлаба', 'https://gitlab.mysite.ru');
this.storage.setValue("domain", new URL(dom).host);


      const tok = prompt("Ввести glpat Токен", pt || "glpat-...........");
      
      this.storage.setValue("pt", tok);
      this.init();
    };
    if (!domain) {
        gitlabBody.innerHTML = '';
        gitlabBody.append(crEl('div',
   
            crEl("button", { e: { click: auth } }, "Ввести данные для доступа к гитлабу"),

        ));

        return;
    }
    
logoLink.setAttribute(`href`, `https://${domain}`);



    fetch(`https://${domain}/api/v4/user`, {
      headers: {
        "PRIVATE-TOKEN": pt,
      },
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized (401)");
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
      })
      .then((user) => {
        gitlabHeader.innerHTML = "";
        gitlabHeader.append(crEl("div", {c:'user-header', s:{backgroundImage: `url(${user.avatar_url})`}},
         
            crEl('strong', {}, user.name),
            crEl('br'),
            crEl('small', {}, user.email),
         
        ));
      })
      .catch((e) => {
        gitlabHeader.innerHTML = "";
        gitlabHeader.append(
          crEl(
            "div",
            {},
            crEl("small", {}, e.message),

          ),
        );

        gitlabBody.innerHTML = '';
        gitlabBody.append(crEl('div',
          crEl("button", { e: { click: () => this.init() } }, "Обновить"),
            crEl('br'),
            crEl("button", { e: { click: auth } }, "Ввести glpat Токен"),

        ))
      });

    const mrItem = (mr) => {
      return crEl(
        "div",
        { c: "mrItem" },
        crEl(
          "a",
          {
            href: mr.web_url,
            target: "_blank",
            title: [mr.title, mr.description].join("\n"),
          },
          mr.blocking_discussions_resolved ? "" : "💬",
          mr.title,
        ),
        crEl(
          "div",
          crEl(
            "small",

            [
              mr.merge_status,
              mr.detailed_merge_status,
              mr.has_conflicts ? "has_conflicts" : "no_conflicts",
            ].join(" • "),
          ),
        ),
      );
    };

    const tick = async () => {
      const assigned_to_me = await fetch(
        "https://gitlab.avelana.ru/api/v4/merge_requests?scope=assigned_to_me",
        {
          headers: {
            "PRIVATE-TOKEN": pt,
          },
        },
      ).then((x) => x.json());

      const assigned = assigned_to_me.filter(
        (s) => s.state == "opened" && !s.draft,
      );

      const reviewerRes = await fetch(
        "https://gitlab.avelana.ru/api/v4/merge_requests?reviewer_username=nikolay.fedoseev",
        {
          headers: {
            "PRIVATE-TOKEN": pt,
          },
        },
      ).then((x) => x.json());

      const reviewer = reviewerRes.filter(
        (s) => s.state == "opened" && !s.draft,
      );

      gitlabBody.innerHTML = "";

      const list2 = crEl(
        "details",
        { open: true },
        crEl("summary", `Need review ${reviewer.length}`),
        reviewer.map((x) => crEl("li", mrItem(x))),
      );

      gitlabBody.append(list2);

      const list1 = crEl(
        "details",
        {},
        crEl("summary", `Assigned ${assigned.length}`),
        assigned.map((x) => crEl("li", mrItem(x))),
      );
      gitlabBody.append(list1);
    };

    tick();

    //setInterval(() => tick(), 5000);
  }
}
customElements.define("widget-gitlab-mr", GitlabMrWidget);
