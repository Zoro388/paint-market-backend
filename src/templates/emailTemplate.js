export const emailLayout = ({
  title,
  subtitle,
  content,
  buttonText,
  buttonLink,
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background:#F5F7FA;
      font-family:Arial,sans-serif;
    "
  >

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="padding:40px 0;"
    >
      <tr>
        <td align="center">

          <table
            width="650"
            cellpadding="0"
            cellspacing="0"
            style="
              background:#ffffff;
              border-radius:16px;
              overflow:hidden;
              box-shadow:0 4px 20px rgba(0,0,0,.08);
            "
          >

            <tr>
              <td
                style="
                  background:#0A2E63;
                  text-align:center;
                  padding:30px;
                "
              >
                <img
                  src="YOUR_CLOUDINARY_LOGO_URL"
                  alt="Paint Domain"
                  width="220"
                />

                <p
                  style="
                    color:#ffffff;
                    margin-top:15px;
                    font-size:14px;
                    letter-spacing:1px;
                  "
                >
                  Everything Paints. One Platform.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:40px">

                <h1
                  style="
                    color:#0A2E63;
                    margin-bottom:10px;
                  "
                >
                  ${title}
                </h1>

                <p
                  style="
                    color:#666;
                    font-size:16px;
                    line-height:1.7;
                  "
                >
                  ${subtitle}
                </p>

                ${content}

                ${
                  buttonText
                    ? `
                    <div
                      style="
                        text-align:center;
                        margin-top:30px;
                      "
                    >
                      <a
                        href="${buttonLink}"
                        style="
                          background:#D4A017;
                          color:white;
                          text-decoration:none;
                          padding:14px 30px;
                          border-radius:8px;
                          display:inline-block;
                          font-weight:bold;
                        "
                      >
                        ${buttonText}
                      </a>
                    </div>
                  `
                    : ""
                }

              </td>
            </tr>

            <tr>
              <td
                style="
                  background:#F8F9FC;
                  padding:25px;
                  text-align:center;
                "
              >
                <p
                  style="
                    color:#666;
                    margin:0;
                    font-size:14px;
                  "
                >
                  Paint Domain
                </p>

                <p
                  style="
                    color:#666;
                    margin:10px 0;
                    font-size:13px;
                  "
                >
                  support@paintdomain.com
                </p>

                <p
                  style="
                    color:#999;
                    font-size:12px;
                  "
                >
                  © 2026 Paint Domain.
                  All rights reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};