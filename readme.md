# Yelp Camp 專案筆記

## Cookies

cookie 是當使用者瀏覽網頁時，存在瀏覽器端的片段資訊。

當 cookie 被設置後，瀏覽器會在之後的每次 request 挾帶 cookie; 使 HTTP 保有狀態(stateful)

常見的使用方式有:

- Session management
- Personalization
- Tracking

## Sessions

和 cookie 相反， sessions 是存在伺服器端的資訊，功用也是讓 HTTP 保有狀態

因為 cookie 有儲存大小的限制，且存放在使用者端也較不安全，採用 sessions 是更佳的選擇

簡單流程是伺服器端儲存資料後把一個 key 存在前端 cookie,這麼做可以減少前端資料儲存，並在每次 request 的時候挾帶 key 從後端取資料。
