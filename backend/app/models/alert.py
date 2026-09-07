from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="", nullable=False)
    # category: 'household' (คนในบ้าน), 'delivery' (คนส่งของ), 'stranger' (คนแปลกหน้า)
    category = Column(String, index=True, nullable=False, default="stranger")
    # severity: 'info', 'warning', 'critical'
    severity = Column(String, nullable=False, default="warning")
    location = Column(String, default="หน้าประตูบ้าน (Main Entrance)", nullable=False)
    detection_id = Column(
        Integer, ForeignKey("detection_history.id", ondelete="SET NULL"), nullable=True
    )
    thumbnail = Column(String, default="", nullable=False)
    is_read = Column(Boolean, default=False, index=True, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), index=True, nullable=False
    )

    detection = relationship("DetectionHistory", backref="alerts")

    def __repr__(self) -> str:
        return f"<Alert(id={self.id}, title='{self.title}', category='{self.category}', is_read={self.is_read})>"
