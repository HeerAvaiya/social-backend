// export default function (fn) {
//     return (req, res, next) => {
//         fn(req, res, next).catch(next);
//     };
// }







export default function (fn) {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            console.error("Backend Error:", err);
            res.status(500).json({
                success: false,
                message: err.message || "Internal Server Error",
            });
        });
    };
}
