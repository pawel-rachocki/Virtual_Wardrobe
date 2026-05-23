--V001 init db
CREATE TYPE category AS ENUM ('HEAD', 'TOP', 'BOTTOM', 'SHOES', 'ACCESSORIES');

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       base_photo_url VARCHAR(255),
                       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                       name VARCHAR(100) NOT NULL,
                       UNIQUE (user_id, name)
);
CREATE TABLE garments (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                       name VARCHAR(100) NOT NULL,
                       brand VARCHAR(100) NOT NULL,
                       color VARCHAR(100) NOT NULL,
                       season VARCHAR(100) NOT NULL,
                       category category NOT NULL,
                       image_url VARCHAR(255) NOT NULL
);

CREATE TABLE garment_tags (
                       garment_id UUID REFERENCES garments(id) ON DELETE CASCADE,
                       tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
                       PRIMARY KEY (garment_id, tag_id)
);

CREATE TABLE outfits (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                       name VARCHAR(100) NOT NULL,
                       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outfit_garments (
                         outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
                         garment_id UUID REFERENCES garments(id) ON DELETE CASCADE,
                         PRIMARY KEY (outfit_id, garment_id)
);

CREATE INDEX idx_garments_user_id    ON garments(user_id);
CREATE INDEX idx_outfits_user_id     ON outfits(user_id);
CREATE INDEX idx_tags_user_id        ON tags(user_id);
CREATE INDEX idx_garment_tags_tag_id ON garment_tags(tag_id);