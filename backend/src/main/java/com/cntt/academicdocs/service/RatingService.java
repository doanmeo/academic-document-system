package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.domain.Rating;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.RatingRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public RatingService(
            RatingRepository ratingRepository,
            DocumentRepository documentRepository,
            UserRepository userRepository
    ) {
        this.ratingRepository = ratingRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void rateDocument(Long documentId, Long userId, Integer score) {
        if (userId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để đánh giá");
        }

        if (score == null || score < 1 || score > 5) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_SCORE", "Điểm đánh giá phải từ 1 đến 5 sao");
        }

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (document.getStatus() != DocumentStatus.APPROVED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "DOCUMENT_NOT_APPROVED", "Chỉ có thể đánh giá tài liệu đã được phê duyệt");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

        Rating rating = ratingRepository.findByUser_IdAndDocument_Id(userId, documentId)
                .orElseGet(() -> {
                    Rating r = new Rating();
                    r.setUser(user);
                    r.setDocument(document);
                    return r;
                });

        rating.setScore(score);
        ratingRepository.save(rating);
    }

    @Transactional
    public void deleteRating(Long documentId, Long userId) {
        if (userId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập");
        }
        ratingRepository.deleteByUser_IdAndDocument_Id(userId, documentId);
    }
}
