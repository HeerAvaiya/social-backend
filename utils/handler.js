export default function (fn) {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            console.error("Backend Error:", err);

            const status = err.statusCode || 500; 
            res.status(status).json({
                success: false,
                message: err.message || "Internal Server Error",
            });
        });
    };
}
