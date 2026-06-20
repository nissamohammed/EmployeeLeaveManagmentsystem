import { Pagination as BSPagination } from "react-bootstrap";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const items = [];
    for (let page = 1; page <= totalPages; page++) {
        items.push(
            <BSPagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => onPageChange(page)}
            >
                {page}
            </BSPagination.Item>
        );
    }

    return (
        <BSPagination className="justify-content-center mt-4">
            <BSPagination.Prev
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            />
            {items}
            <BSPagination.Next
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            />
        </BSPagination>
    );
};

export default Pagination;
